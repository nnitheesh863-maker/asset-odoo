import{c as t,j as e,l as d}from"./index-CNv0BdFy.js";/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=t("Minus",[["path",{d:"M5 12h14",key:"1ays0h"}]]);/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=t("TrendingDown",[["polyline",{points:"22 17 13.5 8.5 8.5 13.5 2 7",key:"1r2t7k"}],["polyline",{points:"16 17 22 17 22 11",key:"11uiuu"}]]);/**
 * @license lucide-react v0.312.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=t("TrendingUp",[["polyline",{points:"22 7 13.5 15.5 8.5 10.5 2 17",key:"126l90"}],["polyline",{points:"16 7 22 7 22 13",key:"kwv8wd"}]]),l={blue:"bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",green:"bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",amber:"bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",red:"bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",purple:"bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",gray:"bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"};function g({title:n,value:o,icon:a,color:x="blue",trend:r,trendValue:s}){const i=r==="up"?m:r==="down"?c:b,p=r==="up"?"text-emerald-600 dark:text-emerald-400":r==="down"?"text-red-600 dark:text-red-400":"text-gray-400";return e.jsxs("div",{className:"stat-card rounded-[24px] border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/70",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("p",{className:"stat-label",children:n}),a&&e.jsx("div",{className:d("rounded-2xl p-2.5",l[x]||l.blue),children:e.jsx(a,{className:"h-5 w-5"})})]}),e.jsxs("div",{className:"mt-3 flex items-end gap-2",children:[e.jsx("p",{className:"stat-value text-2xl sm:text-3xl",children:o}),s!==void 0&&e.jsxs("span",{className:d("mb-1 flex items-center gap-0.5 text-xs font-medium",p),children:[e.jsx(i,{className:"h-3.5 w-3.5"}),s]})]})]})}export{g as S,m as T};
