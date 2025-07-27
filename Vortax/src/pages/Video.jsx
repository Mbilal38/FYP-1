import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Video.module.css';
import Hls from 'hls.js';

const Video = () => {
  const location = useLocation();
  const { videoUrl } = location.state || {};
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [availableQualities, setAvailableQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState('auto');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [error, setError] = useState(null);
  const [isHLSStream, setIsHLSStream] = useState(false);
  const controlsTimeout = useRef(null);

  // Hide controls after 3 seconds of inactivity
  useEffect(() => {
    const handleMouseMove = () => {
      setIsControlsVisible(true);
      clearTimeout(controlsTimeout.current);
      controlsTimeout.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(controlsTimeout.current);
    };
  }, []);

  // Improved URL validation function
  const isValidVideoUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    
    // Remove any leading/trailing whitespace
    const cleanUrl = url.trim();
    
    // Valid URL patterns
    const validPatterns = [
      /^https?:\/\//i,           // http:// or https://
      /^\/\//i,                  // Protocol-relative URLs (//example.com/video.mp4)
      /^\/[^/]/,                 // Absolute paths (/videos/file.mp4)
      /^blob:/i,                 // Blob URLs
      /^data:/i,                 // Data URLs
      /^file:/i,                 // File URLs (for local development)
      /^[a-zA-Z0-9][a-zA-Z0-9+.-]*:/  // Any valid URI scheme
    ];
    
    // Check if URL matches any valid pattern
    return validPatterns.some(pattern => pattern.test(cleanUrl));
  };

  // Initialize player
  useEffect(() => {
    if (!videoUrl) return;
    
    const video = videoRef.current;
    let hls = null;

    // Define fullscreen change handler inside the effect
    const handleFullscreenChange = () => {
      setIsFullscreen(
        Boolean(
          document.fullscreenElement || 
          document.webkitFullscreenElement || 
          document.mozFullScreenElement
        )
      );
    };

    const updateProgress = () => {
      setCurrentTime(video.currentTime);
      if (video.duration) {
        setDuration(video.duration);
      }
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      // Set initial volume after metadata is loaded
      video.volume = volume;
      video.playbackRate = playbackRate;
    };

    // Add fullscreen event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);

    try {
      // Improved URL validation
      if (!isValidVideoUrl(videoUrl)) {
        console.warn('Potentially invalid video URL:', videoUrl);
        // Don't immediately fail - let the video element try to load it
        // setError('Invalid video URL format. Please check the URL and try again.');
        // return;
      }

      // Check if HLS is needed
      const isHLS = videoUrl.toLowerCase().includes('.m3u8');
      setIsHLSStream(isHLS);
      
      // Log video URL for debugging
      console.log('Loading video URL:', videoUrl);
      console.log('Is HLS stream:', isHLS);
      
      if (isHLS) {
        if (Hls.isSupported()) {
          hls = new Hls({
            // Add some configuration for better error handling
            enableWorker: false, // Disable worker for better compatibility
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hlsRef.current = hls;
          
          hls.loadSource(videoUrl);
          hls.attachMedia(video);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            const levels = hls.levels;
            if (levels && levels.length > 0) {
              const qualities = levels.map((level, index) => ({
                id: index,
                label: `${level.height}p`,
                height: level.height
              }));
              // Sort by quality (highest first)
              qualities.sort((a, b) => b.height - a.height);
              setAvailableQualities(qualities);
            } else {
              // Fallback HLS qualities if levels are not detected properly
              setAvailableQualities([
                { id: '0', label: '1080p', height: 1080 },
                { id: '1', label: '720p', height: 720 },
                { id: '2', label: '480p', height: 480 }
              ]);
            }
          });
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS Error:', event, data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('Network error, trying to recover...');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('Media error, trying to recover...');
                  hls.recoverMediaError();
                  break;
                default:
                  console.error('Fatal HLS error:', data);
                  setError(`HLS playback error: ${data.details || 'Unknown error'}`);
                  break;
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS support (Safari)
          video.src = videoUrl;
          // Set default qualities for Safari HLS
          setAvailableQualities([
            { id: '1080', label: '1080p', height: 1080 },
            { id: '720', label: '720p', height: 720 },
            { id: '480', label: '480p', height: 480 },
            { id: '360', label: '360p', height: 360 }
          ]);
        } else {
          setError('HLS is not supported in this browser');
        }
      } else {
        // Regular video file (MP4, etc)
        console.log('Setting up regular video player');
        
        // Check video format support
        const supportedFormats = {
          'mp4': video.canPlayType('video/mp4'),
          'webm': video.canPlayType('video/webm'),
          'ogg': video.canPlayType('video/ogg'),
        };
        console.log('Browser format support:', supportedFormats);
        
        // Set the video source directly - let the browser handle URL validation
        video.src = videoUrl;
        
        // For regular videos, these are just display options since we only have one source
        setAvailableQualities([
          { id: 'original', label: 'Original', height: 9999 },
          { id: '1080', label: '1080p', height: 1080 },
          { id: '720', label: '720p', height: 720 },
          { id: '480', label: '480p', height: 480 },
          { id: '360', label: '360p', height: 360 }
        ]);
        setCurrentQuality('original'); // Set default to original for regular videos
      }

      // Event listeners
      video.addEventListener('timeupdate', updateProgress);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('play', () => setIsPlaying(true));
      video.addEventListener('pause', () => setIsPlaying(false));
      video.addEventListener('ended', () => setIsPlaying(false));
      video.addEventListener('error', (e) => {
        console.error('Video error:', e.target.error);
        const error = e.target.error;
        let errorMessage = 'Video playback failed';
        
        if (error) {
          switch (error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = 'Video playback was aborted';
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = 'Network error while loading video. Please check your connection and the video URL.';
              break;
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = 'Video decode error - the video may be corrupted or use an unsupported codec';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'Video format not supported or URL is invalid/inaccessible';
              break;
            default:
              errorMessage = error.message || 'Unknown video error';
          }
        }
        
        setError(`${errorMessage}. Video URL: ${videoUrl}`);
      });

      // Add a load event to clear any existing errors when video loads successfully
      video.addEventListener('loadstart', () => {
        setError(null);
      });

    } catch (err) {
      console.error('Player initialization error:', err);
      setError('Player initialization error: ' + err.message);
    }

    // Cleanup function
    return () => {
      if (hls) {
        hls.destroy();
      }
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
        video.removeEventListener('timeupdate', updateProgress);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('play', () => setIsPlaying(true));
        video.removeEventListener('pause', () => setIsPlaying(false));
        video.removeEventListener('ended', () => setIsPlaying(false));
        video.removeEventListener('error', () => {});
        video.removeEventListener('loadstart', () => {});
      }
      
      // Remove fullscreen listeners
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, [videoUrl, volume]);

  // Separate effect for playback rate changes
  useEffect(() => {
    if (videoRef.current && videoRef.current.readyState >= 1) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Player control functions
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(err => {
        console.error('Playback failed:', err);
        setError('Playback failed: ' + err.message);
      });
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (videoRef.current) {
      videoRef.current.muted = newMuted;
    }
    if (newMuted) {
      setVolume(0);
    } else {
      setVolume(1);
    }
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setPlaybackRate(newSpeed);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.mozRequestFullScreen) {
        containerRef.current.mozRequestFullScreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
    }
  };

  const handleQualityChange = (e) => {
    const qualityId = e.target.value;
    setCurrentQuality(qualityId);
    
    // For HLS streams with hls.js
    if (hlsRef.current && isHLSStream) {
      if (qualityId === 'auto') {
        hlsRef.current.currentLevel = -1; // Auto quality
      } else {
        hlsRef.current.currentLevel = parseInt(qualityId);
      }
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!videoUrl) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <i className="fas fa-exclamation-triangle"></i>
          No video URL provided! Please select a video to play.
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
        <div className={styles.errorActions}>
          <button 
            className={styles.retryButton}
            onClick={() => {
              setError(null);
              // Force re-initialization by triggering useEffect
              const video = videoRef.current;
              if (video) {
                video.load();
              }
            }}
          >
            Retry
          </button>
          <button 
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Reload Player
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`${styles.videoContainer} ${isFullscreen ? styles.fullscreen : ''}`}
      style={{ width: '660px', height: '440px' }}
    >
      <video
        ref={videoRef}
        className={styles.videoElement}
        onClick={togglePlay}
      />
      
      {/* Controls Overlay */}
      <div 
        className={`${styles.controlsOverlay} ${isControlsVisible ? styles.visible : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar */}
        <div className={styles.progressBarContainer}>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className={styles.progressBar}
          />
          <div className={styles.timeInfo}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Main Controls */}
        <div className={styles.mainControls}>
          <div className={styles.leftControls}>
            <button onClick={togglePlay} className={styles.controlButton}>
              {isPlaying ? (
                <i className="fas fa-pause"></i>
              ) : (
                <i className="fas fa-play"></i>
              )}
            </button>
            
            <div className={styles.volumeControl}>
              <button onClick={toggleMute} className={styles.controlButton}>
                {isMuted || volume === 0 ? (
                  <i className="fas fa-volume-mute"></i>
                ) : volume > 0.5 ? (
                  <i className="fas fa-volume-up"></i>
                ) : (
                  <i className="fas fa-volume-down"></i>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className={styles.volumeSlider}
              />
            </div>
            
            <div className={styles.timeDisplay}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
          
          <div className={styles.rightControls}>
            <div className={styles.speedControl}>
              <select
                value={playbackRate}
                onChange={handleSpeedChange}
                className={styles.speedSelect}
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                  <option key={speed} value={speed}>{speed}x</option>
                ))}
              </select>
            </div>
            
            {availableQualities.length > 0 && (
              <div className={styles.qualityControl}>
                <select
                  value={currentQuality}
                  onChange={handleQualityChange}
                  className={styles.qualitySelect}
                >
                  {isHLSStream && <option value="auto">Auto</option>}
                  {availableQualities.map(quality => (
                    <option key={quality.id} value={quality.id}>
                      {quality.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <button onClick={toggleFullscreen} className={styles.controlButton}>
              {isFullscreen ? (
                <i className="fas fa-compress"></i>
              ) : (
                <i className="fas fa-expand"></i>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Play overlay when paused */}
      {!isPlaying && (
        <div className={styles.playOverlay} onClick={togglePlay}>
          <div className={styles.playIcon}>
            <i className="fas fa-play"></i>
          </div>
        </div>
      )}
    </div>
  );
};

export default Video;