import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]"
import dbConnect from "@/utils/dbConnect";
import Accounts from "@/models/Accounts";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !req.body) {
    res.status(200).json({ answer: "Reload" });
    return;
  }

  const { url } = JSON.parse(req.body);
  const profile = session.user;
  
  let query = { email: profile.email };

  await dbConnect();
  let user = await Accounts.findOne(query);

  if (!user) {
    res.status(200).json({ answer: "Reload" });
    return;
  }

  let appIndex = user.applications.findIndex(app => app.url == url);
  
  if (appIndex > -1) {
    let applications = user.applications;
    applications.splice(appIndex, 1);
    user.applications = [...applications];

    user.save();
    res.status(200).json({ variant: "success", answer: "Application Deleted!" });
  }
  
  else {
    res.status(200).json({ variant: "warning", answer: "Application doesn't exist." });
  }
}