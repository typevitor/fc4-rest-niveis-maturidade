import  { Response } from "express";

export function responseCached(
  restData: { res: Response; body: any },
  cacheData: {
    maxAge: number;
    type: "public" | "private";
    //immutable?: boolean,
    noCacheType?: "no-store" | "no-cache" | "both";
    revalidate: "must-revalidate" | "proxy-revalidate" | "no-revalidate";
  }
){
  const { res, body } = restData;
  const { maxAge, type, noCacheType, revalidate } = cacheData;

  const bodyJson = "toJson" in body ? body.toJson() : body;

  const revalidateFlag = revalidate === "no-revalidate" ? "no-revalidate" :           
    "revalidate";

  //const bodyRaw = JSON.stringify(bodyJson);

  //   const hash = crypto.createHash("sha256").update(bodyRaw).digest("base64");

  //   if (res.req.headers["if-none-match"] === hash) {
  //     console.log("ETag hit");
  //     res.status(304).end(); // Not Modified
  //     return;
  //   }

  //   res.setHeader("ETag", hash);

  //const immutableFlag = immutable ? ", immutable" : "";

  let noCacheFlag = "";
  switch (noCacheType) {
    case "no-store":
      noCacheFlag = "no-store";
      break;
    case "no-cache":
      noCacheFlag = "no-cache";
      break;
    case "both":
      noCacheFlag = "no-store, no-cache";
      break;
  }

  res.set(
    "Cache-Control", 
    `${type}, max-age=${maxAge}, ${revalidateFlag}, ${noCacheFlag}`
  );

  res.json(bodyJson);
}