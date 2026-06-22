import bcrypt from "bcrypt";

const hash = await bcrypt.hash("admin2026", 10);

console.log(hash);