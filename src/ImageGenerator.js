import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Modal from 'react-modal';
import BounceLoader from 'react-spinners/BounceLoader';


const ImageGenerator = () => {
    const [image, setImage] = useState(null);
    const [text, setText] = useState('');
    const [messages, setMessages] = useState([]);
    const [style, setStyle] = useState('');
    const [uploadModalIsOpen, setUploadModalIsOpen] = useState(false);
    const [askModalIsOpen, setAskModalIsOpen] = useState(false);
    const [queryText, setQueryText] = useState('');
    const [responseText, setResponseText] = useState('');
    const [downloadModalIsOpen, setDownloadModalIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAskLoading, setIsAskLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);


    const openai_api_key = process.env.REACT_APP_OPENAI_API_KEY;
    
    const handleSubmit = async (event) => {
    event.preventDefault();
    if (text.trim() === '') return; // don't send empty messages

    console.log(style);
    console.log(text)

    if(style == "") {
        alert("Please select a Style")
    }
    else{
        console.log("Great")
        // add the user message to the messages list
        setMessages([...messages, { text, type: 'user' }]);
        setText('');
        setStyle('')

        // show the loader
        setIsLoading(true);


        // call the API here using the `text` state
        const engineId = 'stable-diffusion-512-v2-1';
        const engineIdSdxl = 'stable-diffusion-xl-beta-v2-2-2';
        const apiHost = process.env.API_HOST ?? 'https://api.stability.ai';
        const apiKey = process.env.REACT_APP_STABILITY_AI_API_KEY;

        const response = await fetch(
            `${apiHost}/v1/generation/${engineId}/text-to-image`,
            {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                text_prompts: [
                {
                    text: text,
                },
                ],
                cfg_scale: 35,
                clip_guidance_preset: 'FAST_GREEN',
                height: 512,
                width: 512,
                samples: 1,
                steps: 70,
                style_preset: style
            }),
            }
        );

        if (!response.ok) {
            throw new Error(`Non-200 response: ${await response.text()}`);
        }

        const responseJSON = await response.json();
        console.log("responseJSON: ", responseJSON);
        setMessages([...messages, { text:text, image: responseJSON.artifacts[0].base64, type: 'bot' }]);
        console.log("messages", messages);
        setIsLoading(false);

    }
    };

    const handleInputTextChange = (event) => {
    setText(event.target.value);
    };

    const handleInputOptionChange = (event) => {
        setStyle(event.target.value)
    }

    const handleDownload = (image) => {
    console.log("Download CLicked");  
    const text = document.getElementById('added-text').value;
    console.log("Entered Text: ", text) 
    if (text.length == 0) {
        // First Code only to download the image 
        console.log(image)
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${image}`;;
        link.download = 'generated-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadModalIsOpen(false)
    }else {

        //New Code with Text Prompt
        // text = 'Hello There !!!'
        // // Create a canvas element and set its size to the size of the image
        // const canvas = document.createElement('canvas');
        // const ctx = canvas.getContext('2d');
        // const img = new Image();
        // img.onload = () => {
        //     canvas.width = img.width;
        //     canvas.height = img.height;

        //     // Draw the image on the canvas
        //     ctx.drawImage(img, 0, 0);

        //     // Set the font and fill style for the text
        //     ctx.font = '30px Arial';
        //     ctx.fillStyle = 'white';

        //     // Draw the text on the canvas
        //     ctx.fillText(text, 10, 50);

        //     // Get the data URL of the canvas
        //     const dataURL = canvas.toDataURL();

        //     // Download the image
        //     const link = document.createElement('a');
        //     link.href = dataURL;
        //     link.download = 'generated-image.png';
        //     document.body.appendChild(link);
        //     link.click();
        //     document.body.removeChild(link);
        // };
        // img.src = `data:image/png;base64,${image}`;

        //New code to add extar space in the image and the prompt there 
        // text =  'Testing the functionality of adding a text prompt in extra added space in the image.';
        // Create a canvas element and set its size to the size of the image plus extra space for the text
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            // Set the font for the text
            ctx.font = '50px Times New Roman';

            // Measure the size of the text
            const textMetrics = ctx.measureText(text);

            // Set the size of the canvas to include extra space for the text
            canvas.width = img.width;
            canvas.height =
            img.height + textMetrics.actualBoundingBoxDescent + textMetrics.actualBoundingBoxAscent;

            // Draw a white rectangle to fill the canvas
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the image on the canvas
            ctx.drawImage(img, 0, 0);

            // Set the fill style for the text
            ctx.fillStyle = 'black';

            // Draw the text on the canvas below the image
            ctx.fillText(text, 10, img.height + textMetrics.actualBoundingBoxAscent);

            // Get the data URL of the canvas
            const dataURL = canvas.toDataURL();

            // Download the image
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'generated-image.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        img.src = `data:image/png;base64,${image}`;
        setDownloadModalIsOpen(false)
    }
    };

    const handlePublish = (event) => {
    console.log("Clicked Publish")
    console.log(event.target.files);
    let selectedFiles=event.target.files;
    const images = [];
        if(selectedFiles.length > 0){
            for (let i = 0; i< selectedFiles.length; i++){
                // console.log("selectedFiles[i]: ",selectedFiles[i])
                let reader = new FileReader();
                reader.readAsDataURL(selectedFiles[i]);
                reader.onloadend = (e) =>{
                    // console.log("reader.result: ", reader.result)
                    // console.log("e.target.result: ", e.target.result);
                    images.push(e.target.result);
                    if (images.length === selectedFiles.length) {
                    // Call the publishBook function with the array of images
                    publishBook(images);
                    }
                }
            }
        }
    };

    const publishBook = (images) => {
        // Create an array of image elements for the selected files
        const imgElements = images.map((image) => {
          const img = document.createElement('img');
          img.src = image;
          return img;
        });
      
        // Set the amount of space between each image
        const spacing = 10;
      
        // Set the width of the border around each image
        const borderWidth = 5;
      
        // Wait for all images to load
        Promise.all(imgElements.map((img) => img.decode())).then(() => {
          // Create a canvas element and set its size to the combined width of the images plus the spacing between them and the border around them
          const canvas = document.createElement('canvas');
          canvas.width =
            imgElements.reduce((totalWidth, img) => totalWidth + img.width, 0) +
            spacing * (imgElements.length - 1) +
            borderWidth * 2 * imgElements.length;
          canvas.height =
            Math.max(...imgElements.map((img) => img.height)) + borderWidth * 2;
      
          // Draw the images side by side on the canvas with spacing and a border between them
          const ctx = canvas.getContext('2d');
          let currentX = borderWidth;
          imgElements.forEach((img, index) => {
            ctx.fillStyle = 'white';
            ctx.fillRect(
              currentX - borderWidth,
              0,
              img.width + borderWidth * 2,
              canvas.height
            );
            ctx.drawImage(img, currentX, borderWidth);
            currentX += img.width + spacing + borderWidth * 2;
          });
      
          // Create a download link and set its href to the data URL of the canvas
          const downloadLink = document.createElement('a');
          downloadLink.href = canvas.toDataURL();
          downloadLink.download = 'combined-image.png';
      
          // Click the download link to download the image
          downloadLink.click();
        });
      };
      

    

    const handleUpload = (event) => {
        console.log("Clicked Upload")
        setIsLoading(true);
        console.log(event.target.files);
        const text = document.getElementById('upload-text').value;
        console.log("Entered Text: ", text)
        if(text.length != 0){
            const file = event.target.files[0];
            setUploadModalIsOpen(false)
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                modifyImage(e.target.result, text)
            };
        }else {
            alert("Please provide an Prompt to modify the image")
        }
    };

    const modifyImage = async(image, text) => {
        console.log("modifyImage", image)
        console.log("modifyImage.base64", image.split(',')[1])

        // const base64Data = image.split(',')[1];
        // const buffer = Buffer.from(base64Data, 'base64');

        const base64Data = image.split(',')[1];
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        // call the API here using the `text` state
        const engineId = 'stable-diffusion-512-v2-1';
        const engineIdSdxl = 'stable-diffusion-xl-beta-v2-2-2';
        const apiHost = process.env.API_HOST ?? 'https://api.stability.ai';
        const apiKey = 'sk-KO8qYUdTWobniZbXx0sbmfesp37qbxAADaHTokKp2BHpV0YZ';

        const formData = new FormData()
        formData.append('init_image', new Blob([bytes], { type: 'image/png' }))
        formData.append('init_image_mode', 'IMAGE_STRENGTH')
        formData.append('image_strength', 0.50)
        formData.append('text_prompts[0][text]', text)
        formData.append('cfg_scale', 25)
        formData.append('clip_guidance_preset', 'FAST_BLUE')
        formData.append('samples', 1)
        formData.append('steps', 50)

        const response = await fetch(
            `${apiHost}/v1/generation/${engineId}/image-to-image`,
            {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: formData,
            }
        );

        if (!response.ok) {
            throw new Error(`Non-200 response: ${await response.text()}`);
        }

        const responseJSON = await response.json();
        console.log("responseJSON: ", responseJSON);
        setMessages([...messages, { text:text, image: responseJSON.artifacts[0].base64, type: 'bot' }]);
        console.log("messages", messages);
        setUploadModalIsOpen(false)
        setIsLoading(false);
    }

    const askChatGPT = async(event) => {
        console.log("ASk Chat")
        const text = document.getElementById('ask-text').value;
        console.log("Entered Text: ", text)
        setQueryText(text)
        setIsAskLoading(true);

        const response = await generateResponse(text);
        console.log("response: ", response)
        setResponseText(response);

        setIsAskLoading(false);
    }

    const generateResponse = async(text) => {
        // Get response from OpenAI
        console.log("generateResponse")

        const payload = {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: text }],
            temperature: 1,
            max_tokens: 500,
          };

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openai_api_key}`,
        },
        method: "POST",
        body: JSON.stringify(payload),
        });

        // Parse response JSON and send it back in the response
        const data = await response.json();
        console.log(data)
        return data.choices[0].message.content
        
    }

    const handleChatGPTmodalClose = () => {
        setResponseText('');
        setAskModalIsOpen(false);
    }

    return (
    <div>
        {isLoading && <BounceLoader />}
        <div style={{textAlign: 'right'}}>
            <></>
            <button className="chatGPT-button" onClick={() => setAskModalIsOpen(true)}>Ask ChatGPT</button>
            <Modal style={{
                content: {
                    width: '790px',
                    height: '273px',
                    backgroundColor: '#ecf1f1',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }
                }} 
                isOpen={askModalIsOpen} 
                onRequestClose={() => handleChatGPTmodalClose()}>
                    <h2 style={{textAlign: 'center'}}>Get Suggestion from chatGPT</h2>
                    <div style={{textAlign: 'center'}}>
                        <input className="ask-message-input" type="text" id="ask-text" placeholder="Enter your prompt here..." />
                        <button className="chatGPT-button" onClick={() => document.getElementById("ask-chatgpt").click()}>Ask</button>
                        <input id="ask-chatgpt" type="text" style={{display: 'none'}} onClick={(event) => {askChatGPT(event)}} />
                    </div>
                    {isAskLoading && <BounceLoader />}
                    {responseText.length>0 && !isLoading && <div className='response-div'>
                        <textarea rows="5" cols="50" className='response-box' value={responseText} readOnly />
                    </div>}
            </Modal>

            <button className="upload-button" onClick={() => setUploadModalIsOpen(true)}>Upload</button>
            <Modal style={{
                content: {
                    width: '580px',
                    height: '188px',
                    backgroundColor: '#ecf1f1',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                  }
                }} 
                isOpen={uploadModalIsOpen} 
                onRequestClose={() => setUploadModalIsOpen(false)}>
                    <h2 style={{textAlign: 'center'}}>Upload Image</h2>
                    <div style={{textAlign: 'center'}}>
                        <input className="upload-message-input" type="text" id="upload-text" placeholder="Enter your prompt here..." />
                        <button className="upload-button" onClick={() => document.getElementById("upload-picture").click()}>Choose Image</button>
                        <input id="upload-picture" type="file" accept="image/*" style={{display: 'none'}} onChange={(event) => {handleUpload(event)}} />
                    </div>
            </Modal>

            <button className="publish-button" onClick={() => document.getElementById("publish-story").click()}>Publish</button>
            <input id="publish-story" type="file" multiple accept="image/*" style={{display: 'none'}} onChange={(event) => {handlePublish(event)}}  />
        </div>

        <div className="chat-container">
        {/* <div className="message-container"> */}
        {messages.map((message, index) => {
            return (
            <div className="message-container">
                 <div key={index} className="user-message">
                    {message.type === 'user' ? (
                    <div >
                        <span style={{ fontWeight: 'bold' }}>You: </span>
                        {message.text}
                    </div>
                    ) : (
                    <div style={{width: 'fit-content'}}>
                        <div key={index} className="bot-message">
                            <img src={`data:image/png;base64,${message.image}`} alt="Generated" />
                        </div>
                        <div style={{textAlign:'right'}}>
                    <button className="download-button" onClick={() => {setDownloadModalIsOpen(true)}}>Download</button>
                    <Modal style={{
                        content: {
                            width: '737px',
                            height: '188px',
                            backgroundColor: '#ecf1f1',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'
                        }
                        }} 
                        isOpen={downloadModalIsOpen} 
                        onRequestClose={() => setDownloadModalIsOpen(false)}>
                            <h2 style={{textAlign: 'center'}}> You can add any text in the image</h2>
                            <div style={{textAlign: 'center'}}>
                                <input className="upload-message-input" type="text" id="added-text" placeholder="Enter your prompt here..." />
                                <button className="upload-button" onClick={() => document.getElementById("download-text-propmt").click()}>Add prompt</button>
                                <input id="download-text-propmt" type="text" style={{display: 'none'}} onClick={(event) => {handleDownload(message.image)}} />
                                
                                <button className="upload-button" onClick={(event) => handleDownload(message.image)}>Don't Add prompt</button>
                            </div>
                    </Modal>
                    </div>
                    </div>
                    
                    )}
                </div>
            </div>    
            );
        })}
        {/* </div> */}
        <form onSubmit={handleSubmit} className='chatBox'>
        <input 
            type="text" 
            className="message-input"
            value={text} 
            onChange={handleInputTextChange} 
            placeholder='Please type your message here...' />
        <select 
            className='dropdown-input'
            type="text"
            value={style}
            onChange={handleInputOptionChange} 
            >
            <option value="" selected disabled>Select Style</option>
            <option value="3d-model">3d Model</option>
            <option value="analog-film">Analog Film</option>
            <option value="anime">Anime</option>
            <option value="cinematic">Cinematic</option>
            <option value="comic-book">Comic Book</option>
            <option value="digital-art">Digital Art</option>
            <option value="enhance">Enhance</option>
            <option value="fantasy-art">Fantasy Art</option>
            <option value="isometric">Isometric</option>
            <option value="line-art">Line Art</option>
            <option value="low-poly">Low Poly</option>
            <option value="modeling-compound">Modeling Compound</option>
            <option value="neon-punk">Neon-Punk</option>
            <option value="origami">Origami</option>
            <option value="photographic">Photographic</option>
            <option value="pixel-art">Pixel Art</option>
            <option value="tile-texture">Tile Texture</option>
        </select>
        <button type="submit" className="message-submit">Send</button>
        </form>
    </div>
    </div>    
    
    );
};

export default ImageGenerator;
