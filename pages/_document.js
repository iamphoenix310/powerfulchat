import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Other head elements */}
          
          {/* Banner */}
          <script dangerouslySetInnerHTML={{ 
            __html: `
              (function(d,z,s){
                s.src='https://' + d + '/400/' + z;
                try {
                  (document.body || document.documentElement).appendChild(s);
                } catch(e) {}
              })('osspalkiaom.com', 6773829, document.createElement('script'));
            `
          }}></script>
        </Head>
        <body>
   <script
      dangerouslySetInnerHTML={{
         __html: `(function(a,b,c,d){a.src=b,s.setAttribute('data-zone',c),d.appendChild(a);})(document.createElement('script'),'https://inklinkor.com/tag.min.js',1234567,document.body||document.documentElement)`,
      }}
   />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
