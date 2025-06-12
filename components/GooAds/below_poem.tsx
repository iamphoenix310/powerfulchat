import Script from 'next/script';

const AdUnit3 = () => {
  const adSlotId = 'div-gpt-ad-1702704799578-0';

  return (
    <div id={adSlotId} style={{ minWidth: '300px', minHeight: '100px' }}>
      <Script 
        id="ad-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            googletag.cmd.push(function() { googletag.display('${adSlotId}'); });
          `,
        }}
      />
    </div>
  );
};

export default AdUnit3;
