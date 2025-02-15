/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";

export const signIn = async ({email, password} : signInProps) => {
    try{
        const { account } = await createAdminClient();
        const response = await account.createEmailPasswordSession(email, password);
        const cookieStore = await cookies();
        cookieStore.set("appwrite-session", response.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        return parseStringify(response);
    }catch(err){
        console.error(err);
    }
}

export const signUp = async (userData : SignUpParams) => {

    const {email, password, firstName, lastName} = userData;

    try{
        const { account } = await createAdminClient();
        const newUserAccount = await account.create(ID.unique(),
        email,
        password,
        `${firstName} ${lastName}`,
        );
        const session = await account.createEmailPasswordSession(email, password);
      
        (await cookies()).set("appwrite-session", session.secret, {
          path: "/",
          httpOnly: true,
          sameSite: "strict",
          secure: true,
        });

        return parseStringify(newUserAccount);
    }catch(err){
        console.error(err);
    }
}


export async function getLoggedInUser() {
    try {
      const { account } = await createSessionClient();
      const user =  await account.get();
      return parseStringify(user);
    } catch (error) {
      return error;
    }
}

export const logoutAccount = async () => {
    try{
        const { account } = await createSessionClient();
        const cookieStore = await cookies();
        cookieStore.delete("appwrite-session");
        await account.deleteSession("current");
        return true;
    }catch(err){
        return err;
    }
}


  