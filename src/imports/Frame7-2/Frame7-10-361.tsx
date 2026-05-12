import svgPaths from "./svg-014f1q4v1h";
import imgScreencaptureLocalhost3000AgreementsNew202603301606141 from "./222346dae3d10b374da0009a818ba8861867fe13.png";
import imgImage6 from "./5e6ca725f061f64368dcf6a9f82b83d21f54a0ee.png";
import imgImage1 from "./a6bb1a01293778b5b03711964e199932e3820b37.png";
import imgImage2 from "./56b66b8f5927f3ca4d43e23fcab297d4847b2372.png";

function ChangeBadge() {
  return (
    <div className="bg-[#2563eb] content-stretch flex flex-col items-start justify-center px-[8px] py-[4px] relative rounded-[4px] shrink-0 w-[66px]" data-name="change-badge-1">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] max-w-[708px] not-italic relative shrink-0 text-[10px] text-white w-full">MODIFIED</p>
    </div>
  );
}

function SummaryChanges() {
  return (
    <div className="content-stretch flex gap-[12px] items-start relative shrink-0 w-full" data-name="summary-changes-1">
      <ChangeBadge />
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[normal] max-w-[708px] min-h-px min-w-px not-italic relative text-[#555] text-[13px]">Initially the cost of maintenance, repair and all for facility management was completely taken care by property owner and now its handed over to the client</p>
    </div>
  );
}

function SummaryItem() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[8px] items-start left-[24px] p-[16px] right-[24px] rounded-[6px] top-[48px]" data-name="summary-item-1">
      <div aria-hidden="true" className="absolute border border-[#e5e7eb] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] max-w-[720px] not-italic relative shrink-0 text-[#1a1a1a] text-[13px] w-full">Responsibility (i):</p>
      <SummaryChanges />
    </div>
  );
}

function ChangeBadge1() {
  return (
    <div className="bg-[#16a34a] content-stretch flex flex-col items-start justify-center px-[8px] py-[4px] relative rounded-[4px] shrink-0 w-[52px]" data-name="change-badge-3">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] max-w-[708px] not-italic relative shrink-0 text-[10px] text-white w-full">ADDED</p>
    </div>
  );
}

function SummaryChanges1() {
  return (
    <div className="absolute content-stretch flex gap-[12px] items-start left-[15px] right-[15px] top-[39px]" data-name="summary-changes-3">
      <ChangeBadge1 />
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[normal] max-w-[708px] min-h-px min-w-px not-italic relative text-[#4b5563] text-[13px]">New obligation requiring Client to provide timely premises access during business hours for Provider personnel</p>
    </div>
  );
}

function SummaryItem1() {
  return (
    <div className="absolute bg-[#f0fdf4] border border-[#bbf7d0] border-solid h-[76px] left-[24px] right-[24px] rounded-[6px] top-[165px]" data-name="summary-item-3">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[15px] not-italic right-[911px] text-[#1a1a1a] text-[13px] top-[15px]">Responsibility (ii):</p>
      <SummaryChanges1 />
      <div className="absolute left-[1591px] size-[40px] top-[17px]" data-name="image 6">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage6} />
      </div>
    </div>
  );
}

function ChangeBadge2() {
  return (
    <div className="bg-[#dc2626] content-stretch flex flex-col items-start justify-center px-[8px] py-[4px] relative rounded-[4px] shrink-0 w-[67px]" data-name="change-badge-4">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] max-w-[708px] not-italic relative shrink-0 text-[10px] text-white w-full">REMOVED</p>
    </div>
  );
}

function SummaryChanges2() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[20px] items-start left-[15px] right-[15px] top-[39px]" data-name="summary-changes-4">
      <ChangeBadge2 />
      <p className="flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[normal] max-w-[708px] min-h-px min-w-px not-italic relative text-[#4b5563] text-[13px]">Obligation to provide quarterly financial reports to Provider has been removed from Client responsibilities</p>
    </div>
  );
}

function SummaryItem2() {
  return (
    <div className="absolute bg-[#fef2f2] border border-[#fecaca] border-solid h-[92px] left-[24px] right-[24px] rounded-[6px] top-[270px]" data-name="summary-item-4">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[normal] left-[15px] not-italic right-[911px] text-[#1a1a1a] text-[13px] top-[15px]">Responsibility (iii):</p>
      <SummaryChanges2 />
    </div>
  );
}

function SummaryContent() {
  return (
    <div className="absolute h-[443px] left-[-1px] right-[-1px] top-[-1px]" data-name="summary-content">
      <SummaryItem />
      <SummaryItem1 />
      <SummaryItem2 />
    </div>
  );
}

function StatDotAdded() {
  return <div className="bg-[#16a34a] rounded-[50px] shrink-0 size-[8px]" data-name="stat-dot-added" />;
}

function StatAdded() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="stat-added">
      <StatDotAdded />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#6b7280] text-[12px] whitespace-nowrap">1 Added</p>
    </div>
  );
}

function StatDotModified() {
  return <div className="bg-[#2563eb] rounded-[50px] shrink-0 size-[8px]" data-name="stat-dot-modified" />;
}

function StatModified() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="stat-modified">
      <StatDotModified />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#6b7280] text-[12px] whitespace-nowrap">1 Modified</p>
    </div>
  );
}

function StatDotRemoved() {
  return <div className="bg-[#dc2626] rounded-[50px] shrink-0 size-[8px]" data-name="stat-dot-removed" />;
}

function StatRemoved() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="stat-removed">
      <StatDotRemoved />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#6b7280] text-[12px] whitespace-nowrap">1 Removed</p>
    </div>
  );
}

function FooterStats() {
  return (
    <div className="absolute content-stretch flex gap-[24px] items-center left-[722.5px] top-[16px]" data-name="footer-stats">
      <StatAdded />
      <StatModified />
      <StatRemoved />
    </div>
  );
}

function SummaryFooter() {
  return (
    <div className="absolute bg-[#fafbfc] h-[68px] left-[-6px] top-[408px] w-[1657px]" data-name="summary-footer">
      <FooterStats />
      <div className="absolute h-[99px] left-[3px] top-[52.5px] w-[1698px]">
        <div className="absolute inset-[0_-0.24%_-8.08%_-0.24%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1706 107">
            <g filter="url(#filter0_d_3_1888)" id="Rectangle 2">
              <path d={svgPaths.p10582900} fill="var(--fill-0, white)" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="107" id="filter0_d_3_1888" width="1706" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dy="4" />
                <feGaussianBlur stdDeviation="2" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_3_1888" />
                <feBlend in="SourceGraphic" in2="effect1_dropShadow_3_1888" mode="normal" result="shape" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}

function SummaryContainer() {
  return (
    <div className="absolute bg-white border border-[#e5e7eb] border-solid h-[463px] left-[112px] rounded-[8px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] top-[1936px] w-[1696px]" data-name="summary-container">
      <SummaryContent />
      <SummaryFooter />
      <div className="absolute left-[1615px] size-[40px] top-[74px]" data-name="image 5">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage6} />
      </div>
      <div className="absolute left-[1615px] size-[40px] top-[296px]" data-name="image 6">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage6} />
      </div>
    </div>
  );
}

function Image() {
  return (
    <div className="relative shrink-0 size-[20px]" data-name="Image">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Image">
          <path d={svgPaths.p22a4a900} fill="var(--fill-0, #6366F1)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function SummaryTitleSection() {
  return (
    <div className="absolute content-stretch flex gap-[10px] items-center left-[145px] top-[1864px]" data-name="summary-title-section">
      <Image />
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[#1a1a1a] text-[16px] whitespace-nowrap">AI Summary of Changes</p>
    </div>
  );
}

export default function Frame() {
  return (
    <div className="bg-white relative size-full">
      <div className="absolute h-[3214px] left-0 top-0 w-[1920px]" data-name="screencapture-localhost-3000-agreements-new-2026-03-30-16_06_14 1">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute left-0 max-w-none size-full top-0" src={imgScreencaptureLocalhost3000AgreementsNew202603301606141} />
        </div>
      </div>
      <SummaryContainer />
      <div className="absolute bg-[#d43f3f] h-[51px] left-[1439px] rounded-[50px] top-[2408px] w-[157px]" />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium h-[57px] leading-[normal] left-[1479px] not-italic text-[25px] text-white top-[2418px] w-[177px]">Reject</p>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[normal] left-[1405px] not-italic text-[#ff0004] text-[21px] top-[1866px] whitespace-nowrap">Show changes</p>
      <div className="absolute bg-white h-[49px] left-[126px] top-[1853px] w-[345px]" />
      <SummaryTitleSection />
      <div className="absolute h-[74px] left-[1604px] top-[2397px] w-[160px]" data-name="image 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
      </div>
      <div className="absolute bg-white h-[109px] left-[42px] top-[2925px] w-[1835px]" />
      <div className="absolute bg-white h-[126px] left-[107px] top-[2509px] w-[1701px]" />
      <div className="absolute h-[429px] left-[36px] top-[2529px] w-[1846px]" data-name="image 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage2} />
      </div>
    </div>
  );
}