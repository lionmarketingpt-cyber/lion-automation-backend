import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/hash";

async function main() {
  const email = "admin@lionboard.test";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await hashPassword("admin123");
    await prisma.user.create({
      data: {
        email,
        name: "Administrador Lion Board",
        passwordHash
      }
    });
    console.log("Usuário padrão criado:", email);
  } else {
    console.log("Usuário padrão já existe.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
