import Adu from "@/components/GooAds/Adu";

const AdUnit = () => {
  return (
    <div className="flex flex-col justify-center items-center mt-5 mb-2">
      <span className="text-xs text-center">Advertisement</span>
      <Adu
        adSlot="9995634858"
        adFormat="auto"
        style={{ display: "inline-block", width: "300px", height: "250px" }}
      />
    </div>
  );
};

export default AdUnit;