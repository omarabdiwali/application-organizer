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

  const { title, url, prevUrl, status, changed } = JSON.parse(req.body);
  const profile = session.user;

  let query = { email: profile.email };

  await dbConnect();
  let user = await Accounts.findOne(query);

  if (!user) {
    res.status(200).json({ answer: "Reload" });
    return;
  }

  let index = user.applications.findIndex(app => app.url == prevUrl);

  if (index === -1) {
    res.status(200).json({ variant: "warning", answer: "Application does not exist!" });
    return;
  }

  if (changed) {
    let created = user.applications.findIndex(app => app.url == url);
    if (created !== -1) {
      res.status(200).json({ variant: "warning", answer: "Application with this URL exists!" });
      return;
    }
  }

  let applications = user.applications;
  let application = { title: title, url: url, status: status, date: applications[index].date };
  applications.splice(index, 1, application);

  user.applications = [...applications];
  user.save();
  
  res.status(200).json({ variant: "success", answer: "Updated Application!" });
}