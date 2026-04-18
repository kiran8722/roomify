import {useLocation, useNavigate} from "react-router";
import {useEffect, useRef, useState} from "react";
import {generate3DView} from "../../lib/ai.action";
import {Box, Download, RefreshCcw, Share2, X} from "lucide-react";
import Button from "../../components/button";


const VisualizeId =() =>{
    const navigate = useNavigate();
  const location = useLocation();
  const {initialImage, initialRendered, name } = location.state || {};

  const initialGenerated =useRef(false);

    const [isProcessing, setIsProcessing] = useState(false);

    const [CurrentImage, setCurrentImage] = useState<string | null>(
      initialRendered ?? null,
    );

    const handleBack = () => navigate('/');

    const runGeneration =async ()=>{
        if(!initialImage) return;

        try {
            setIsProcessing(true);
            const result = await generate3DView({sourceImage: initialImage});

            if (result.renderedImage) {
                setCurrentImage(result.renderedImage);
            }
        }
        catch(e){
        console.error('Generation Failed',e);
            }
            finally {
            setIsProcessing(false);

        }
        };

    useEffect(() => {
        if (initialGenerated.current) {
            return;
        }

        initialGenerated.current = true;

        if (initialRendered) {
            setCurrentImage(initialRendered);
            return;
        }

        void runGeneration();
    }, [initialImage, initialRendered]);



  return (
      <div className="visualizer">
          <nav className="topbar">
              <div className="brand">
                  <Box className="logo" />

                  <span className="name">Roomify</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleBack} className="exit">
                  <X className="icon" /> Exit Editor
              </Button>
          </nav>

          <section className="content">
              <div className="panel">
                  <div className="panel-header">
                      <div className="panel-meta">
                          <p>{name || "Project"}</p>
                          <p className="note">Created by You</p>
                      </div>

                      <div className="panel-actions">
                          <Button
                              size="sm"
                              className="export"
                              disabled={!CurrentImage}
                          >
                              <Download className="w-4 h-4 mr-2" /> Export
                          </Button>
                          <Button size="sm" onClick={() => {}} className="share">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                          </Button>
                      </div>
                  </div>

                  <div className={`render-area ${isProcessing ? 'is-processing': ''}`}>
                      {CurrentImage ? (
                          <img src={CurrentImage} alt="AI Render" className="render-img" />
                      ) : (
                          <div className="render-placeholder">
                              {initialImage && (
                                  <img src={initialImage} alt="Original" className="render-fallback" />
                              )}
                          </div>
                      )}

                      {isProcessing && (
                          <div className="render-overlay">
                              <div className="rendering-card">
                                  <RefreshCcw className="spinner" />
                                  <span className="title">Rendering...</span>
                                  <span className="subtitle">Generating your 3D visualization</span>
                              </div>
                          </div>
                      )}
                  </div>

              </div>
              </section>
      </div>
  )

};
export default VisualizeId;

