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

  const { title, url, status } = JSON.parse(req.body);
  const profile = session.user;

  let query = { email: profile.email };
  let application = { title: title, url: url, status: status, date: new Date() };

  await dbConnect();
  let user = await Accounts.findOne(query);

  if (!user) {
    res.status(200).json({ answer: "Reload" });
    return;
  }

  let created = user.applications.find(app => app.url == url);
  
  if (created !== undefined) {
    res.status(200).json({ variant: "warning", answer: "Application has already been added!" });
    return;
  }

  user.applications.push(application);
  user.save();
  
  res.status(200).json({ variant: "success", answer: "Added Application!" });
}