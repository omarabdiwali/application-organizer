import AddApplication from "@/components/addApplications";
import DeleteApplication from "@/components/deleteApplication";
import UpdateApplication from "@/components/updateApplication";
import { signIn, useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { AiOutlinePlusCircle, AiOutlineArrowLeft, AiOutlineArrowRight, AiOutlineDelete, AiOutlineClose, AiOutlineCheck, AiOutlineEdit } from "react-icons/ai";

export default function Home() {
  const { data: session, status } = useSession();
  const [loaded, setLoaded] = useState(false);
  const [applications, setApplications] = useState([]);
  const [prevPage, setPrevPage] = useState(0);
  const [nextPage, setNextPage] = useState(10);

  const [applied, setApplied] = useState(0);
  const [oa, setOa] = useState(0);
  const [interviews, setInterviews] = useState(0);
  const [offers, setOffers] = useState(0);
  const [rejections, setRejections] = useState(0);

  const orderApplications = (app, app1) => {
    const statuses = ["Rejected", "Applied", "Online Assessment", "Interviews", "Offer"];
    let index = 4;
    
    let appStatus = app.status;
    let app1Status = app1.status;

    let appValue = -1;
    let app1Value = -1;

    if (appStatus.indexOf("Rejected") > -1) {
      appValue = 0;
    } if (app1Status.indexOf("Rejected") > -1) {
      app1Value = 0;
    }

    while (appValue == -1 || app1Value == -1) {
      if (appValue == -1) {
        appValue = appStatus.indexOf(statuses[index]) > -1 ? index : -1;
      } if (app1Value == -1) {
        app1Value = app1Status.indexOf(statuses[index]) > -1 ? index : -1;
      }

      index -= 1;
    }

    if (appValue > app1Value) {
      return -1;
    } else if (app1Value > appValue) {
      return 1;
    } else {
      return app.date > app1.date ? -1 : 1;
    }
  }

  const update = (title, url, status, prevUrl) => {
    let copyApplications = JSON.parse(JSON.stringify(applications));
    let index = copyApplications.findIndex(app => app.url == prevUrl);
    copyApplications[index].title = title;
    copyApplications[index].url = url;
    copyApplications[index].status = status;

    copyApplications = copyApplications.sort(orderApplications);
    setApplications(copyApplications);
  }

  const add = (application) => {
    let copyApplications = JSON.parse(JSON.stringify(applications));
    copyApplications.push(application);
    copyApplications = copyApplications.sort(orderApplications);
    setApplications(copyApplications);
  }

  const deleteApp = (url) => {
    let copyApplications = JSON.parse(JSON.stringify(applications));
    let index = copyApplications.findIndex(app => app.url == url);
    copyApplications.splice(index, 1);
    copyApplications = copyApplications.sort(orderApplications);
    setApplications(copyApplications);
  }

  const movePage = (dir) => {
    if (dir == "next") {
      setPrevPage(nextPage);
      setNextPage(nextPage + 10);
    } else {
      setNextPage(prevPage);
      setPrevPage(prevPage - 10);
    }
  }

  const getCount = (apps) => {
    let a = 0;
    let o = 0;
    let i = 0;
    let off = 0;
    let r = 0;

    for (let i = 0; i < apps.length; i++) {
      const app = apps[i];
      let status = app.status;

      if (status.indexOf("Applied") > -1) {
        a += 1;
      } if (status.indexOf("Online Assessment") > -1) {
        o += 1;
      } if (status.indexOf("Interviews") > -1) {
        i += 1;
      } if (status.indexOf("Offer") > -1) {
        off += 1;
      } if (status.indexOf("Rejected") > -1) {
        r += 1;
      }
    }

    setApplied(a);
    setOa(o);
    setInterviews(i);
    setOffers(off);
    setRejections(r);
  }

  useEffect(() => {
    if (status === "loading" || status === "unauthenticated") return;
    
    fetch("/api/applications/get", {
      method: "POST",
      body: JSON.stringify({ email: session.user.email })
    }).then(res => res.json()).then(data => {
      let apps = data.applications.sort(orderApplications);
      setApplications(apps);
      getCount(apps);
      setLoaded(true);
    }).catch(err => console.error(err));

  }, [status, session])

  if (status !== "unauthenticated" && !loaded) {
    return (
      <div className="flex h-screen">
        <div className="m-auto">
          <svg className="animate-spin h-10 w-10 mr-3 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen">
        <div className="m-auto">
          <div onClick={() => signIn('google')} className='mt-5 cursor-pointer bg-blue-300 hover:bg-blue-400 text-black font-semibold py-2 px-4 border border-gray-400 rounded shadow'>
            Sign In With Google
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {!loaded ? "" :
        <>
           <div className="flex m-7 mr-4 text-md justify-end space-x-3">
            <div className={`flex-1 m-auto`}><AddApplication className={"text-2xl rounded-3xl p-2 hover:bg-slate-300 hover:text-black"} func={add} button={<AiOutlinePlusCircle />} /></div>
            <button className="disabled:opacity-20 text-2xl enabled:hover:text-slate-500" onClick={() => movePage("prev")} disabled={prevPage == 0}><AiOutlineArrowLeft /></button>
            <button className="disabled:opacity-20 text-2xl enabled:hover:text-slate-500" onClick={() => movePage("next")} disabled={nextPage >= applications.length}><AiOutlineArrowRight /></button>
          </div>

          <table className="border-collapse table-auto w-full">
            <thead>
              <tr>
                <th className="border-b dark:border-slate-600 font-medium pl-4 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left"></th>
                <th className="border-b dark:border-slate-600 font-medium pr-4 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left"></th>
                <th className="border-b dark:border-slate-600 font-medium p-3 pt-0 pb-3 text-slate-800 dark:text-slate-200 text-left">Title</th>
                <th className="border-b dark:border-slate-600 font-medium p-3 pt-0 pb-3 text-slate-800 dark:text-slate-200 text-left">Date</th>
                <th className="border-b dark:border-slate-600 font-medium p-3 pt-0 pb-3 text-slate-800 dark:text-slate-200 text-left">URL</th>
                <th className="border-b dark:border-slate-600 font-medium p-3 pt-0 pb-3 text-slate-800 dark:text-slate-200 text-left">Applied</th>
                <th className="border-b dark:border-slate-600 font-medium p-3 pt-0 pb-3 text-slate-800 dark:text-slate-200 text-left">OA</th>
                <th className="border-b dark:border-slate-600 font-medium p-3 pt-0 pb-3 text-slate-800 dark:text-slate-200 text-left">Interviews</th>
                <th className="border-b dark:border-slate-600 font-medium p-3 pt-0 pb-3 text-slate-800 dark:text-slate-200 text-left">Rejected</th>
                <th className="border-b dark:border-slate-600 font-medium p-3 pr-8 pt-0 pb-3 text-slate-800 dark:text-slate-200 text-left">Offer</th>
              </tr>
            </thead>
            <tbody className="bg-slate-200 dark:bg-slate-800">
              {applications.slice(prevPage, nextPage).map((application, i) => {
                let date = new Date(application.date).toLocaleDateString();
                let title = application.title;
                let url = application.url;
                let status = application.status;

                return (
                  <tr key={i + prevPage}>
                    <td className="border-b border-slate-300 dark:border-slate-700 pl-4 text-slate-500 dark:text-slate-400">
                      <DeleteApplication func={deleteApp} button={<AiOutlineDelete />} url={url} />
                    </td>
                    <td className="border-b border-slate-300 dark:border-slate-700 pr-4 text-slate-500 dark:text-slate-400">
                      <UpdateApplication func={update} ogTitle={title} ogUrl={url} ogStatus={status} button={<AiOutlineEdit />} />
                    </td>
                    <td className="border-b text-xs border-slate-300 dark:border-slate-700 p-3 text-slate-700 dark:text-slate-400">{title}</td>
                    <td className="border-b text-sm border-slate-300 dark:border-slate-700 p-3 text-slate-700 dark:text-slate-400">{date}</td>
                    <td className="border-b text-xs border-slate-300 dark:border-slate-700 p-3 text-slate-700 dark:text-slate-400"><a className="hover:underline" target="__blank" href={url}>{url}</a></td>
                    <td className="border-b border-slate-300 dark:border-slate-700 p-3 text-slate-700 dark:text-slate-400">{status.indexOf("Applied") > -1 ? <AiOutlineCheck className="m-auto" color="green" /> : <AiOutlineClose className="m-auto" color="red" />}</td>
                    <td className="border-b border-slate-300 dark:border-slate-700 p-3 text-slate-700 dark:text-slate-400">{status.indexOf("Online Assessment") > -1 ? <AiOutlineCheck className="m-auto" color="green" /> : <AiOutlineClose className="m-auto" color="red" />}</td>
                    <td className="border-b border-slate-300 dark:border-slate-700 p-3 text-slate-700 dark:text-slate-400">{status.indexOf("Interviews") > -1 ? <AiOutlineCheck className="m-auto" color="green" /> : <AiOutlineClose className="m-auto" color="red" />}</td>
                    <td className="border-b border-slate-300 dark:border-slate-700 p-3 text-slate-700 dark:text-slate-400">{status.indexOf("Rejected") > -1 ? <AiOutlineCheck className="m-auto" color="green" /> : <AiOutlineClose className="m-auto" color="red" />}</td>
                    <td className={`border-b border-slate-300 text-slate-700 dark:text-slate-400 dark:border-slate-700 p-3 pr-8`}>{status.indexOf("Offer") > -1 ? <AiOutlineCheck className="m-auto" color="green" /> : <AiOutlineClose className="m-auto" color="red" />}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-slate-200 dark:bg-black">
              <tr className="font-extrabold">
                <td className="p-3 text-slate-500 dark:text-slate-400">TOTAL</td>
                <td className="p-3 text-slate-500 dark:text-slate-400"></td>
                <td className="p-3 text-slate-500 dark:text-slate-400"></td>
                <td className="p-3 text-slate-500 dark:text-slate-400"></td>
                <td className="p-3 text-slate-500 dark:text-slate-400"></td>
                <td className="p-3 text-center text-slate-500 dark:text-slate-400">{applied}</td>
                <td className="p-3 text-center text-slate-500 dark:text-slate-400">{oa}</td>
                <td className="p-3 text-center text-slate-500 dark:text-slate-400">{interviews}</td>
                <td className="p-3 text-center text-slate-500 dark:text-slate-400">{rejections}</td>
                <td className={`text-slate-500 text-center dark:text-slate-400 p-3 pr-8`}>{offers}</td>
              </tr>
            </tfoot>
          </table>
        </>
      }
    </>
  )
}
