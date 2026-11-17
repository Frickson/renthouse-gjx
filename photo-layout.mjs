/** Layout planner for up to three photo appendix pages (PDF pages 10–12).
 * Empty appendix pages are omitted; the nine agreement pages remain.
 */
const PLAN = Object.freeze({
  0:[0,0,0], 1:[1,0,0], 2:[2,0,0], 3:[2,1,0],
  4:[2,2,0], 5:[2,2,1], 6:[2,2,2],
  7:[4,2,1], 8:[4,2,2], 9:[4,4,1], 10:[4,4,2],
});
export function photoDistribution(count) {
  if(!Number.isInteger(count)||count<0||count>10) throw new Error('Select 10 photos or fewer.');
  return [...PLAN[count]];
}
export function photoSlots(count) {
  // 595.44 × 841.68 PDF coordinates (top-left origin); leave footer untouched.
  if(count===0) return [];
  if(count===1) return [{x:85,y:95,w:425,h:530}];
  if(count===2) return [
    {x:85,y:66,w:425,h:304},
    {x:85,y:395,w:425,h:304},
  ];
  if(count===4) return [
    {x:79,y:62,w:208,h:301},{x:309,y:62,w:208,h:301},
    {x:79,y:389,w:208,h:301},{x:309,y:389,w:208,h:301},
  ];
  throw new Error('Only 1, 2 and 4 photo page grids are supported.');
}
export function fitContained(imgWidth,imgHeight,rect,margin=8,caption=18){
  if(imgWidth<=0||imgHeight<=0)throw new Error('Photo dimensions must be positive.');
  const availableW=rect.w-2*margin,availableH=rect.h-2*margin-caption;
  const scale=Math.min(availableW/imgWidth,availableH/imgHeight);
  const w=imgWidth*scale,h=imgHeight*scale;
  return {x:rect.x+(rect.w-w)/2,y:rect.y+margin+(availableH-h)/2,w,h};
}

export function agreementPageCount(count) { return 9 + photoDistribution(count).filter(Boolean).length; }
