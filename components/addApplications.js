import isUrl from "is-url";
import { enqueueSnackbar } from "notistack";
import { useState } from "react"

export default function AddApplication({ func, button, className }) {
  const [title, setTitle] = useState("");
  const [url, setURL] = useState("");
  const [status, setStatus] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [open, setOpen] = useState(false);

  const addApplication = () => {
    let trimTitle = title.trim();
    let trimUrl = url.trim();

    if (trimTitle.length == 0 || trimUrl.length == 0 || status.length == 0) return;
    if (!isUrl(url.trim())) {
      enqueueSnackbar("URL is not valid.", { variant: "info", autoHideDuration: 3000 });
      return;
    }

    let app = { title: trimTitle, url: trimUrl, status: status, date: new Date() };
    setDisabled(true);
    
    fetch("/api/applications/add", {
      method: "POST",
      body: JSON.stringify({ title: trimTitle, url: trimUrl, status: status })
    }).then(res => res.json()).then(data => {
      if (data.answer == "Reload") {
        window.location.href = "/";
        return;
      }
      if (data.variant == "success") {
        closeModal();
        enqueueSnackbar(data.answer, { autoHideDuration: 3000, variant: data.variant });
        func(app);
      } else {
        enqueueSnackbar(data.answer, { autoHideDuration: 3000, variant: data.variant });
        setDisabled(false);
      }
    })
  }

  const closeModal = () => {
    setTitle("");
    setURL("");
    setStatus("");
    setOpen(false);
    setDisabled(false);
  }

  const changeTitle = (e) => {
    setTitle(e.target.value);
  }
  const changeUrl = (e) => {
    setURL(e.target.value);
  }
  const changeStatus = (e, value) => {
    if (e.target.checked) {
      setStatus(status + value);
    } else {
      setStatus(status.replace(value, ""))
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={className}>
        {button}
      </button>

      <div className={`cursor-auto text-white ${!open ? "hidden" : ""} z-50`}>
        <div className={`fixed flex h-screen inset-0 z-50 transition-all duration-300 delay-150 ease-in-out ${!open ? "opacity-0 hidden" : "opacity-100"} w-full overflow-x-hidden overflow-y-auto md:inset-0 h-96 max-h-full`}>
          <div className="relative m-auto w-full max-w-2xl max-h-full">
            <div className="relative rounded-lg shadow bg-slate-700">
              <div className="text-2xl font-bold p-3 m-3">Add Application</div>
              <div className="flex space-x-5 flex-row m-5">
                <div>Title:</div>
                <input className="focus:border-light-blue-500 focus:ring-1 focus:ring-light-blue-500 focus:outline-none w-full text-sm text-black placeholder-gray-500 border border-gray-200 rounded-md py-2 pl-10 p-3" type="text" value={title} onChange={changeTitle}aria-label="Title" placeholder="Title..." />
              </div>
              <div className="flex m-5 space-x-5 flex-row m-5">
                <div>URL:</div>
                <input className="focus:border-light-blue-500 focus:ring-1 focus:ring-light-blue-500 focus:outline-none w-full text-sm text-black placeholder-gray-500 border border-gray-200 rounded-md py-2 pl-10 p-3" type="text" value={url} onChange={changeUrl} aria-label="URL" placeholder="URL..." />
              </div>
              <div className="flex m-5 space-y-2 flex-col m-5">
                <div></div>
                <label><input checked={status.includes("Applied")} onChange={e => changeStatus(e, "Applied")} className="mr-2" type="checkbox"></input>Applied</label>
                <label><input checked={status.includes("Online")} onChange={e => changeStatus(e, "Online Assessment")} className="mr-2" type="checkbox"></input>Online Assessment</label>
                <label><input checked={status.includes("Inter")} onChange={e => changeStatus(e, "Interviews")} className="mr-2" type="checkbox"></input>Interviews</label>
                <label><input checked={status.includes("Offer")} onChange={e => changeStatus(e, "Offer")} className="mr-2" type="checkbox"></input>Offer</label>
                <label><input checked={status.includes("Reject")} onChange={e => changeStatus(e, "Rejected")} className="mr-2" type="checkbox"></input>Rejected</label>
              </div>
              <div className="flex items-center justify-end p-6 space-x-2 rounded-b border-gray-600">
                <button disabled={disabled} className="disabled:opacity-75 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-black text-center disabled:bg-blue-700 bg-blue-600 enabled:hover:bg-blue-700 focus:ring-blue-800" onClick={addApplication}>Add</button>
                <button className="focus:ring-4 focus:outline-none rounded-lg border text-sm font-medium px-5 py-2.5 focus:z-10 bg-gray-700 text-gray-300 border-gray-500 hover:text-white hover:bg-gray-600 focus:ring-gray-600" onClick={closeModal}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={`ml-0 cursor-auto w-full opacity-25 fixed inset-0 z-10 bg-black ${!open ? "hidden" : ""}`}></div>
    </>
  )
}