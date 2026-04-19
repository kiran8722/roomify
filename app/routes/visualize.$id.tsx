import {useLocation, useNavigate, useParams} from "react-router";
import {useEffect, useRef, useState} from "react";
import {generate3DView} from "../../lib/ai.action";
import {getProject, saveProject} from "../../lib/puter.action";
import {Box, Download, RefreshCcw, Share2, X} from "lucide-react";
import Button from "../../components/button";


const VisualizeId =() =>{
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const location = useLocation();
  const routeState = (location.state ?? null) as VisualizerLocationState | null;
  const initialImage = routeState?.initialImage ?? null;
  const initialRendered = routeState?.initialRender ?? routeState?.initialRender ?? null;
  const name = routeState?.name ?? null;
  const lastInitKeyRef = useRef<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasResolvedProject, setHasResolvedProject] = useState(false);
  const [designItem, setDesignItem] = useState<DesignItem | null>(() => {
    if (!projectId || !initialImage) {
      return null;
    }

    return {
      id: projectId,
      name,
      sourceImage: initialImage,
      renderedImage: initialRendered,
      timestamp: Date.now(),
    };
  });
  const [CurrentImage, setCurrentImage] = useState<string | null>(initialRendered);

  const handleBack = () => navigate('/');

  useEffect(() => {
    let isActive = true;

    const loadProject = async () => {
      if (!projectId) {
        setHasResolvedProject(true);
        return;
      }

      const savedProject = await getProject(projectId);
      if (!isActive) {
        return;
      }

      if (savedProject) {
        setDesignItem(savedProject);
        setCurrentImage(savedProject.renderedImage ?? initialRendered);
      } else if (initialImage) {
        setDesignItem({
          id: projectId,
          name,
          sourceImage: initialImage,
          renderedImage: initialRendered,
          timestamp: Date.now(),
        });
        setCurrentImage(initialRendered);
      }

      setHasResolvedProject(true);
    };

    void loadProject();

    return () => {
      isActive = false;
    };
  }, [initialImage, initialRendered, name, projectId]);

  const runGeneration = async () => {
    if (!designItem?.sourceImage) {
      return;
    }

    try {
      setIsProcessing(true);
      const result = await generate3DView({
        sourceImage: designItem.sourceImage,
        projectId: designItem.id,
      });

      if (result.renderedImage) {
        const optimisticItem: DesignItem = {
          ...designItem,
          renderedImage: result.renderedImage,
        };

        setCurrentImage(result.renderedImage);
        setDesignItem(optimisticItem);

        try {
          const savedProject = await saveProject(optimisticItem);
          if (savedProject) {
            setDesignItem(savedProject);
            setCurrentImage(savedProject.renderedImage ?? result.renderedImage);
          } else {
            console.error("Failed to persist rendered image");
          }
        } catch (error) {
          console.error("Failed to persist rendered image", error);
        }
      }
    } catch (e) {
      console.error('Generation Failed',e);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!hasResolvedProject || !designItem?.sourceImage) {
      return;
    }

    const initKey = `${designItem.id}:${designItem.sourceImage}`;
    if (lastInitKeyRef.current === initKey) {
      return;
    }

    lastInitKeyRef.current = initKey;

    if (designItem.renderedImage) {
      setCurrentImage(designItem.renderedImage);
      return;
    }

    setCurrentImage(null);
    void runGeneration();
  }, [designItem, hasResolvedProject]);



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
                          <p>{designItem?.name || name || "Project"}</p>
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
                               {designItem?.sourceImage && (
                                   <img src={designItem.sourceImage} alt="Original" className="render-fallback" />
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
