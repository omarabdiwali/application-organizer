import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import dbConnect from "@/utils/dbConnect";
import Accounts from "@/models/Accounts";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.status(200).json({message: "Not logged in."});
    return;
  }

  const profile = session.user;
  
  let query = { email: profile.email };
  let data = { name: profile.name, email: profile.email, applications: [] };

  await dbConnect();
  let user = await Accounts.findOne(query);

  if (user) {
    res.status(200).json({ applications: user.applications, message: "Logged in." });
  } else {
    await Accounts.create(data).catch(err => console.log(err));
    res.status(200).json({ applications: [], message: "Logged in." });
  }
}