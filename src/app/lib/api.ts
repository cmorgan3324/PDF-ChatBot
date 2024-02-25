// How we interact with the API

export async function uploadFile(file: File) {
  const formData = new FormData(); // FormData is a way for you to submit forms and upload files
  formData.append("file", file);

  const res = await fetch("/api/files", {
    method: "POST",
    body: formData,
  });

  return res;
}
