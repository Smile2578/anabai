// app/api/auth/[...nextauth]/route.ts

import { handlers } from "@/auth"; // Importez depuis 'auth.ts' qui contient la configuration complète

export const { GET, POST } = handlers;
