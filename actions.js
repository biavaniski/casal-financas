"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function signup(formData) {
  const mode = formData.get("mode");
  const name = formData.get("name");
  const email = formData.get("email")?.toLowerCase().trim();
  const password = formData.get("password");

  if (!name || !email || !password) {
    throw new Error("Preencha todos os campos.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Este e-mail já está em uso.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  let coupleId;

  if (mode === "create") {
    const coupleName = formData.get("coupleName");
    if (!coupleName) throw new Error("Informe o nome da conta do casal.");

    const couple = await prisma.couple.create({
      data: { name: coupleName, inviteCode: generateInviteCode() },
    });
    coupleId = couple.id;
  } else {
    const inviteCode = formData.get("inviteCode")?.toUpperCase().trim();
    if (!inviteCode) throw new Error("Informe o código de convite.");

    const couple = await prisma.couple.findUnique({ where: { inviteCode } });
    if (!couple) throw new Error("Código de convite inválido.");
    coupleId = couple.id;
  }

  await prisma.user.create({
    data: { name, email, password: hashedPassword, coupleId },
  });

  redirect("/login");
}

export async function addTransaction(formData) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.coupleId) {
    throw new Error("Não autorizado ou usuário sem casal vinculado.");
  }
  const coupleId = session.user.coupleId;

  if (!checkRateLimit(coupleId, 30, 60000)) {
    throw new Error("Muitas requisições em pouco tempo. Aguarde um momento.");
  }

  const type = formData.get("type");
  const rawValue = formData.get("value") || "0";
  const value = parseFloat(String(rawValue).replace(",", "."));
  const description = formData.get("description");
  const categoryId = formData.get("categoryId") || null;
  const accountId = formData.get("accountId") || null;
  const personId = formData.get("personId");
  const date = formData.get("date");
  const paid = formData.get("paid") === "on";

  await prisma.transaction.create({
    data: {
      coupleId,
      type,
      description,
      value,
      date: new Date(date),
      paid,
      personId: personId || "1",
      categoryId: categoryId || undefined,
      accountId: accountId || undefined,
    },
  });

  if (paid && accountId) {
    const account = await prisma.account.findFirst({
      where: { id: accountId, coupleId },
    });
    
    if (account) {
      await prisma.account.update({
        where: { id: accountId },
        data: {
          balance: { increment: type === "income" ? value : -value },
        },
      });
    }
  }

  revalidatePath("/lancamentos", "layout");
  revalidatePath("/dashboard", "layout");
}

export async function togglePaid(id) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.coupleId) {
    throw new Error("Não autorizado.");
  }
  const coupleId = session.user.coupleId;

  const transaction = await prisma.transaction.findFirst({
    where: { id, coupleId },
  });
  if (!transaction) throw new Error("Lançamento não encontrado.");

  const newPaid = !transaction.paid;

  await prisma.transaction.update({
    where: { id },
    data: { paid: newPaid },
  });

  if (transaction.accountId) {
    const account = await prisma.account.findFirst({
      where: { id: transaction.accountId, coupleId },
    });

    if (account) {
      const delta = transaction.type === "income" ? transaction.value : -transaction.value;
      await prisma.account.update({
        where: { id: transaction.accountId },
        data: { balance: { increment: newPaid ? delta : -delta } },
      });
    }
  }

  revalidatePath("/lancamentos", "layout");
  revalidatePath("/dashboard", "layout");
}
