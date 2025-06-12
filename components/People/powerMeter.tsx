interface PowerMeterProps {
    value: number;
  }
  
  const PowerMeter: React.FC<PowerMeterProps> = ({ value }) => {
    const progress = Math.max(0, Math.min(100, (value / 10000) * 100)); // Clamp value between 0 and 100
    const filledColor = progress === 100 ? 'bg-gray-900' : 'bg-gray-700'; // Charcoal grey for filled color
    const textColor = progress < 50 ? 'text-gray-900' : 'text-white'; // Text color based on progress
    return (
      <div className="relative h-4 w-full bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full ${filledColor}`} style={{ width: `${progress}%` }}>
          <div className={`absolute inset-0 flex items-center justify-center ${textColor} text-xs`}>
            {value}
          </div>
        </div>
      </div>
    );
  };
  
  export default PowerMeter;
  