import{c as a,k as t}from"./index-CNv0BdFy.js";/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=a("ClipboardCheck",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}],["path",{d:"m9 14 2 2 4-4",key:"df797q"}]]),o={async getCycles(e){return(await t.get("/audits",{params:e})).data},async getCycleById(e){return(await t.get(`/audits/${e}`)).data},async createCycle(e){return(await t.post("/audits",e)).data},async createItem(e){return(await t.post("/audits/items",e)).data},async updateItem(e,s){return(await t.put(`/audits/items/${e}`,s)).data},async completeCycle(e){return(await t.post(`/audits/${e}/complete`)).data},async getStats(){return(await t.get("/audits/stats")).data},async getDiscrepancies(e){return(await t.get(`/audits/${e}/discrepancies`)).data}};export{c as C,o as a};
