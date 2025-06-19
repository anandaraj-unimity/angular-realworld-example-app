import { HttpInterceptorFn } from "@angular/common/http";

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const apiReq = req.clone({ url: `https://d2cnode.dev.betabasket.net${req.url}` });
  return next(apiReq);
};
