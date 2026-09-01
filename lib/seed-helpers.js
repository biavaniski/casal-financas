import { prisma } from "./prisma";

const EXPENSE_CATS = [
  ["Moradia", "#4A6B5A"], ["Alimentação", "#B3261E"], ["Transporte", "#2C6E9E"],
  ["Saúde", "#8C5FBF"], ["Lazer", "#B8860B"], ["Compras", "#C2703D"],
  ["Assinaturas", "#5B7FBF"], ["Outros", "#8A8A82"],
];
const INCOME_CATS = [["Salário", "#2F8F5B"], ["Freelance", "#4A6B5A"], ["Outros", "#8A8A82"]];

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function createCoupleWithDefaults(name) {
  let inviteCode = randomCode();
  while (await prisma.couple.findUnique({ where: { inviteCode } })) {
    inviteCode = randomCode();
  }
  const couple = await prisma.couple.create({ data: { name, inviteCode } });

  await prisma.category.createMany({
    data: [
      ...EXPENSE_CATS.map(([n, c]) => ({ coupleId: couple.id, name: n, type: "expense", color: c })),
      ...INCOME_CATS.map(([n, c]) => ({ coupleId: couple.id, name: n, type: "income", color: c })),
    ],
  });

  await prisma.account.create({
    data: { coupleId: couple.id, name: "Conta principal", balance: 0 },
  });

  return couple;
}
