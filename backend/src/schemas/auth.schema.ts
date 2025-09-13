import { z } from "zod";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export const registerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(10, "Número de celular inválido"),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .regex(
      passwordRegex,
      "A senha deve conter letra maiúscula, minúscula, número e caractere especial"
    ),
});

export const loginSchema = z.object({
  phone: z.string().min(10, "Número de celular inválido"),
  password: z.string().min(8, "Senha inválida"),
});

/* Explicação do regex

^(?=.*[a-z])  ------->  pelo menos uma letra minúscula  
(?=.*[A-Z])   ------->  pelo menos uma letra maiúscula  
(?=.*\d)      ------->  pelo menos um número  
(?=.*[\W_])   ------->  pelo menos um caractere especial (não alfanumérico)  
.{8,}         ------->  mínimo de 8 caracteres

*/
