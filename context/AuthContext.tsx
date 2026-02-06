// "use client";

// import React, { JSX, use } from "react";
// import { createContext, useContext, useEffect, useMemo, useState } from "react";

// type UserCredentials = {
//   name: string;
//   password: string;
// };

// type AuthContextType = {
//   getUser: () => Promise<UserCredentials | null>;
//   login: (credentials: UserCredentials) => Promise<void>;
//   logout: () => Promise<void>;
//   isSignedIn: boolean | null;
// };

// export const AuthContext = createContext<AuthContextType | null>(null);

// /**
//  * Provider context buat si Auth
//  * @param children - Child buat di render
//  * @param children.children - Sama aja cuman nambah satu buat di render
//  * @returns Providernya
//  */

// export const AuthProvider = ({
//   children,
// }: {
//   children: React.ReactNode;
// }): JSX.Element => {
//   const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
//   const { getUser, login, logout } = useMemo((state) => state);
//   const router = useRouter();
//   const pathname = usePathname();


// };
