export default async function handler(req, res) {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
       
      },
      body: JSON.stringify({
        // Pinned to a specific version of Stable Diffusion
        // See https://replicate.com/stability-ai/sdxl
        version: "2b017d9b67edd2ee1401238df49d75da53c523f36e363881e057f5dc3ed3c5b2",
  
        // This is the text prompt that will be submitted by a form on the frontend
        input: { prompt: req.body.prompt,
          width: 768,
          height: 1024,
          num_outputs: 3,
          negative_prompt: "bad anatomy\nbad proportions\nblurry\ncloned face\ncropped\ndeformed\ndehydrated\ndisfigured\nduplicate\nerror\nextra arms\nextra fingers\nextra legs\nextra limbs\nfused fingers\ngross proportions\njpeg artifacts\nlong neck\nlow quality\nlowres\nmalformed limbs\nmissing arms\nmissing legs\nmorbid\nmutated hands\nmutation\nmutilated\nout of frame\npoorly drawn face\npoorly drawn hands\nsignature\ntext\ntoo many fingers\nugly\nusername\nwatermark\nworst quality",
        },
      }),
    });
  
    if (response.status !== 201) {
      let error = await response.json();
      res.statusCode = 500;
      res.end(JSON.stringify({ detail: error.detail }));
      return;
    }
  
    const prediction = await response.json();
    res.statusCode = 201;
    res.end(JSON.stringify(prediction));
  }