document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // NAVIGATION & TAB SWITCHING
  // ==========================================
  const navButtons = document.querySelectorAll('.nav-btn');
  const pageSections = document.querySelectorAll('.page-section');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetPageId = btn.getAttribute('data-target');
      
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      pageSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === targetPageId) {
          section.classList.add('active');
        }
      });

      // Scroll to top of page on switch
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Header Scroll Effect
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Project Tabs (Sidebar Navigation)
  const projectTabBtns = document.querySelectorAll('.project-tab-btn');
  const projectDetailPanels = document.querySelectorAll('.project-detail-panel');

  projectTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetProjId = btn.getAttribute('data-project');
      
      projectTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      projectDetailPanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === targetProjId) {
          panel.classList.add('active');
        }
      });

      // Re-initialize specific widgets when their tab is visible
      if (targetProjId === 'p2') {
        initWidget2();
      } else if (targetProjId === 'p3') {
        initWidget3();
      } else if (targetProjId === 'p5') {
        initWidget5();
      }
    });
  });


  // ==========================================
  // WIDGET 1: PERIPHERAL DRAG & DROP
  // ==========================================
  const w1Items = document.querySelectorAll('.w1-item-draggable');
  const w1Slots = document.querySelectorAll('.w1-port-slot');
  const w1Status = document.getElementById('w1-status');
  const w1ResetBtn = document.getElementById('w1-reset-btn');
  const w1Dock = document.querySelector('.w1-items-dock');

  let draggedItem = null;

  w1Items.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedItem = item;
      e.dataTransfer.setData('text/plain', item.id);
      item.style.opacity = '0.5';
    });

    item.addEventListener('dragend', () => {
      item.style.opacity = '1';
    });
  });

  w1Slots.forEach(slot => {
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!slot.classList.contains('connected')) {
        slot.classList.add('hovered');
      }
    });

    slot.addEventListener('dragleave', () => {
      slot.classList.remove('hovered');
    });

    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.classList.remove('hovered');

      const itemId = e.dataTransfer.getData('text/plain');
      const itemElement = document.getElementById(itemId);

      if (itemElement && !slot.classList.contains('connected')) {
        const itemType = itemElement.getAttribute('data-type');
        const acceptType = slot.getAttribute('data-accept');
        const spec = itemElement.getAttribute('data-spec');
        const itemName = itemElement.querySelector('.w1-item-name').innerText;
        const icon = itemElement.querySelector('.w1-item-icon').innerText;

        if (itemType === acceptType) {
          // Success Connection
          slot.classList.add('connected');
          slot.innerHTML = `<span style="font-size: 1.5rem;">${icon}</span>
                            <span class="w1-port-name" style="color: var(--success); font-weight:700;">ĐÃ KẾT NỐI</span>
                            <span style="font-size:0.75rem; color:var(--text-primary); margin-top:2px;">${itemName}</span>`;
          
          itemElement.style.display = 'none'; // hide from dock
          
          w1Status.innerHTML = `🎉 <strong>Kết nối thành công!</strong> Đã cắm <strong>${itemName}</strong> vào cổng thích hợp. (${spec})`;
          w1Status.style.color = 'var(--primary)';
        } else {
          // Error Mismatch
          w1Status.innerHTML = `⚠️ <strong>Sai cổng kết nối!</strong> Thiết bị <strong>${itemName}</strong> không hỗ trợ chuẩn giao tiếp này. Hãy thử lại.`;
          w1Status.style.color = 'var(--error)';
        }
      }
    });
  });

  w1ResetBtn.addEventListener('click', () => {
    // Reset dock items
    w1Items.forEach(item => {
      item.style.display = 'flex';
    });
    // Reset slots
    w1Slots.forEach(slot => {
      slot.classList.remove('connected');
      const accept = slot.getAttribute('data-accept');
      let defaultLabel = '';
      let defaultIcon = '';
      if (accept === 'hdmi') { defaultLabel = 'Cổng HDMI'; defaultIcon = '📺'; }
      if (accept === 'usbc') { defaultLabel = 'Cổng USB-C'; defaultIcon = '⚡'; }
      if (accept === 'usba') { defaultLabel = 'Cổng USB-A'; defaultIcon = '🔌'; }
      if (accept === 'audio') { defaultLabel = 'Cổng Audio 3.5mm'; defaultIcon = '🎧'; }

      slot.innerHTML = `<span style="font-size: 1.2rem;">${defaultIcon}</span>
                        <span class="w1-port-name">${defaultLabel}</span>`;
    });
    w1Status.innerText = 'Đã đặt lại thùng máy. Hãy thực hiện kéo thả các thiết bị ngoại vi vào cổng tương ứng.';
    w1Status.style.color = 'var(--text-secondary)';
  });


  // ==========================================
  // WIDGET 2: DATA MINING & STATS (SVG CHART)
  // ==========================================
  const w2Input = document.getElementById('w2-data-input');
  const w2AnalyzeBtn = document.getElementById('w2-analyze-btn');
  const w2RandomBtn = document.getElementById('w2-random-btn');
  const statMean = document.getElementById('stat-mean');
  const statMedian = document.getElementById('stat-median');
  const statStdev = document.getElementById('stat-stdev');
  const chartContainer = document.getElementById('w2-chart-container');

  function calculateStats(numbers) {
    if (numbers.length === 0) return { mean: 0, median: 0, stdev: 0 };
    
    // Mean
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / numbers.length;

    // Median
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    // Standard Deviation
    let stdev = 0;
    if (numbers.length > 1) {
      const variance = numbers.reduce((sq, val) => sq + Math.pow(val - mean, 2), 0) / (numbers.length - 1);
      stdev = Math.sqrt(variance);
    }

    return { mean, median, stdev };
  }

  function drawSVGChart(numbers) {
    chartContainer.innerHTML = '';
    const svgWidth = 450;
    const svgHeight = 220;
    const padding = 30;
    const chartW = svgWidth - padding * 2;
    const chartH = svgHeight - padding * 2;

    // Create SVG element
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
    svg.style.overflow = 'visible';

    // Grid lines & Y Axis values (0, 2.5, 5, 7.5, 10)
    for (let i = 0; i <= 4; i++) {
      const val = (10 / 4) * i;
      const y = padding + chartH - (chartH / 4) * i;

      // Line
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", padding);
      line.setAttribute("y1", y);
      line.setAttribute("x2", padding + chartW);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", "rgba(255,255,255,0.06)");
      line.setAttribute("stroke-width", "1");
      svg.appendChild(line);

      // Label
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", padding - 8);
      text.setAttribute("y", y + 4);
      text.setAttribute("fill", "var(--text-muted)");
      text.setAttribute("font-size", "9");
      text.setAttribute("text-anchor", "end");
      text.textContent = val.toFixed(1);
      svg.appendChild(text);
    }

    // Bar width and spacing
    const barSpacing = 8;
    const numBars = numbers.length;
    const totalSpacing = barSpacing * (numBars - 1);
    const barWidth = Math.max(12, (chartW - totalSpacing) / numBars);

    // Render Bars
    numbers.forEach((num, index) => {
      const barH = (num / 10) * chartH;
      const x = padding + index * (barWidth + barSpacing);
      const y = padding + chartH - barH;

      // Group for mouse interactivity
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.style.cursor = 'pointer';

      // Bar rect
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", barWidth);
      rect.setAttribute("height", Math.max(2, barH));
      rect.setAttribute("rx", "3");
      rect.setAttribute("fill", "url(#bar-gradient)");
      rect.style.transition = 'all 0.3s ease';
      
      // Gradient definition (once)
      if (index === 0) {
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        grad.setAttribute("id", "bar-gradient");
        grad.setAttribute("x1", "0%");
        grad.setAttribute("y1", "0%");
        grad.setAttribute("x2", "0%");
        grad.setAttribute("y2", "100%");
        
        const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop1.setAttribute("offset", "0%");
        stop1.setAttribute("stop-color", "var(--primary)");
        
        const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop2.setAttribute("offset", "100%");
        stop2.setAttribute("stop-color", "var(--secondary)");
        
        grad.appendChild(stop1);
        grad.appendChild(stop2);
        defs.appendChild(grad);
        svg.appendChild(defs);
      }

      // Tooltip Text inside Group
      const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "text");
      tooltip.setAttribute("x", x + barWidth / 2);
      tooltip.setAttribute("y", y - 6);
      tooltip.setAttribute("fill", "var(--accent)");
      tooltip.setAttribute("font-size", "10");
      tooltip.setAttribute("font-weight", "bold");
      tooltip.setAttribute("text-anchor", "middle");
      tooltip.style.opacity = '0';
      tooltip.style.transition = 'opacity 0.2s';
      tooltip.textContent = num.toFixed(1);

      // Label below bar
      const lbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
      lbl.setAttribute("x", x + barWidth / 2);
      lbl.setAttribute("y", padding + chartH + 15);
      lbl.setAttribute("fill", "var(--text-muted)");
      lbl.setAttribute("font-size", "8");
      lbl.setAttribute("text-anchor", "middle");
      lbl.textContent = `SV ${index + 1}`;

      group.appendChild(rect);
      group.appendChild(tooltip);
      group.appendChild(lbl);

      // Interaction
      group.addEventListener('mouseenter', () => {
        rect.setAttribute("fill", "var(--accent)");
        tooltip.style.opacity = '1';
      });
      group.addEventListener('mouseleave', () => {
        rect.setAttribute("fill", "url(#bar-gradient)");
        tooltip.style.opacity = '0';
      });

      svg.appendChild(group);
    });

    // Draw main axes
    const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xAxis.setAttribute("x1", padding);
    xAxis.setAttribute("y1", padding + chartH);
    xAxis.setAttribute("x2", padding + chartW);
    xAxis.setAttribute("y2", padding + chartH);
    xAxis.setAttribute("stroke", "var(--border-glass-focus)");
    xAxis.setAttribute("stroke-width", "1.5");
    svg.appendChild(xAxis);

    chartContainer.appendChild(svg);
  }

  function initWidget2() {
    const raw = w2Input.value;
    const scores = raw.split(',')
                      .map(v => parseFloat(v.trim()))
                      .filter(num => !isNaN(num) && num >= 0 && num <= 10);
    
    if (scores.length === 0) {
      alert("Vui lòng nhập dãy số hợp lệ từ 0 đến 10!");
      return;
    }

    const stats = calculateStats(scores);
    statMean.innerText = stats.mean.toFixed(2);
    statMedian.innerText = stats.median.toFixed(1);
    statStdev.innerText = stats.stdev.toFixed(2);

    drawSVGChart(scores);
  }

  w2AnalyzeBtn.addEventListener('click', initWidget2);

  w2RandomBtn.addEventListener('click', () => {
    const len = Math.floor(Math.random() * 5) + 8; // 8 to 12 values
    const vals = [];
    for (let i = 0; i < len; i++) {
      // generates random score between 4.0 and 10.0
      const score = Math.floor(Math.random() * 60 + 40) / 10;
      vals.push(score.toFixed(1));
    }
    w2Input.value = vals.join(', ');
    initWidget2();
  });

  // Init W2 on load
  initWidget2();


  // ==========================================
  // WIDGET 3: NEURAL NET & DRAWING CANVAS
  // ==========================================
  const w3Canvas = document.getElementById('w3-canvas');
  const w3Ctx = w3Canvas.getContext('2d');
  const w3ClearBtn = document.getElementById('w3-clear-btn');
  const w3PredictBtn = document.getElementById('w3-predict-btn');
  const w3PredVal = document.getElementById('w3-pred-val');
  const w3ConfFill = document.getElementById('w3-conf-fill');
  const w3NeuralSvg = document.getElementById('w3-neural-svg');
  
  let isDrawing = false;
  let strokePoints = [];

  // Setup Canvas
  w3Ctx.strokeStyle = '#ffffff';
  w3Ctx.lineWidth = 10;
  w3Ctx.lineCap = 'round';
  w3Ctx.lineJoin = 'round';

  function getMousePos(canvasDom, event) {
    const rect = canvasDom.getBoundingClientRect();
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getMousePos(w3Canvas, e);
    w3Ctx.beginPath();
    w3Ctx.moveTo(pos.x, pos.y);
    strokePoints.push(pos);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getMousePos(w3Canvas, e);
    w3Ctx.lineTo(pos.x, pos.y);
    w3Ctx.stroke();
    strokePoints.push(pos);
  }

  function stopDrawing() {
    isDrawing = false;
  }

  w3Canvas.addEventListener('mousedown', startDrawing);
  w3Canvas.addEventListener('mousemove', draw);
  w3Canvas.addEventListener('mouseup', stopDrawing);
  w3Canvas.addEventListener('mouseleave', stopDrawing);

  w3Canvas.addEventListener('touchstart', startDrawing);
  w3Canvas.addEventListener('touchmove', draw);
  w3Canvas.addEventListener('touchend', stopDrawing);

  w3ClearBtn.addEventListener('click', () => {
    w3Ctx.clearRect(0, 0, w3Canvas.width, w3Canvas.height);
    strokePoints = [];
    w3PredVal.innerText = 'VẼ MỘT HÌNH';
    w3ConfFill.style.width = '0%';
    resetNeuralAnimation();
  });

  // Quick Neural Net SVG Line drawing
  function initWidget3() {
    w3NeuralSvg.innerHTML = '';
    const svgWidth = w3NeuralSvg.clientWidth || 300;
    const svgHeight = w3NeuralSvg.clientHeight || 140;

    const layers = [
      { id: 'layer-input', count: 4, x: svgWidth * 0.15 },
      { id: 'layer-hidden', count: 3, x: svgWidth * 0.5 },
      { id: 'layer-output', count: 2, x: svgWidth * 0.85 }
    ];

    // Compute node coordinates
    const nodes = [];
    layers.forEach((layer, layerIdx) => {
      const spacing = svgHeight / (layer.count + 1);
      const layerNodes = [];
      for (let i = 0; i < layer.count; i++) {
        layerNodes.push({
          x: layer.x,
          y: spacing * (i + 1)
        });
      }
      nodes.push(layerNodes);
    });

    // Draw connection lines
    for (let l = 0; l < nodes.length - 1; l++) {
      const fromLayer = nodes[l];
      const toLayer = nodes[l + 1];
      fromLayer.forEach(fromNode => {
        toLayer.forEach(toNode => {
          const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          line.setAttribute("x1", fromNode.x);
          line.setAttribute("y1", fromNode.y);
          line.setAttribute("x2", toNode.x);
          line.setAttribute("y2", toNode.y);
          line.setAttribute("stroke", "rgba(255,255,255,0.06)");
          line.setAttribute("stroke-width", "1");
          line.classList.add('nn-line');
          w3NeuralSvg.appendChild(line);
        });
      });
    }
  }

  function animateNeuralNet() {
    const lines = w3NeuralSvg.querySelectorAll('.nn-line');
    const inputNodes = document.querySelectorAll('#layer-input .w3-node');
    const hiddenNodes = document.querySelectorAll('#layer-hidden .w3-node');
    const outputNodes = document.querySelectorAll('#layer-output .w3-node');

    resetNeuralAnimation();

    // Stage 1: Input nodes active
    inputNodes.forEach((node, i) => {
      setTimeout(() => node.classList.add('active'), i * 80);
    });

    // Stage 2: Glow lines from Input to Hidden
    setTimeout(() => {
      lines.forEach(line => {
        const x1 = parseFloat(line.getAttribute('x1'));
        if (x1 < 100) { // first half lines
          line.setAttribute('stroke', 'rgba(0, 255, 255, 0.4)');
          line.setAttribute('stroke-width', '1.5');
        }
      });
      hiddenNodes.forEach((node, i) => {
        setTimeout(() => node.classList.add('active-sec'), i * 100);
      });
    }, 350);

    // Stage 3: Glow lines from Hidden to Output
    setTimeout(() => {
      lines.forEach(line => {
        const x1 = parseFloat(line.getAttribute('x1'));
        if (x1 > 100) { // second half lines
          line.setAttribute('stroke', 'rgba(139, 92, 246, 0.4)');
          line.setAttribute('stroke-width', '1.5');
        }
      });
      outputNodes.forEach((node, i) => {
        setTimeout(() => node.classList.add('active'), i * 100);
      });
    }, 700);
  }

  function resetNeuralAnimation() {
    document.querySelectorAll('.w3-node').forEach(node => {
      node.classList.remove('active', 'active-sec');
    });
    w3NeuralSvg.querySelectorAll('.nn-line').forEach(line => {
      line.setAttribute('stroke', 'rgba(255,255,255,0.06)');
      line.setAttribute('stroke-width', '1');
    });
  }

  // Heuristics-based drawn shape analyzer
  w3PredictBtn.addEventListener('click', () => {
    if (strokePoints.length < 5) {
      w3PredVal.innerText = 'HÃY VẼ GÌ ĐÓ!';
      return;
    }

    // Extract Bounding Box
    let minX = w3Canvas.width, maxX = 0, minY = w3Canvas.height, maxY = 0;
    strokePoints.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    const width = maxX - minX;
    const height = maxY - minY;
    
    if (width < 5 && height < 5) {
      w3PredVal.innerText = 'DẤU CHẤM 🔴';
      return;
    }

    const aspect = width / height;

    // Calculate details for shape
    // Center point
    const cx = minX + width / 2;
    const cy = minY + height / 2;

    // Calculate average distance from center to estimate circularity
    let totalDist = 0;
    strokePoints.forEach(p => {
      const dx = p.x - cx;
      const dy = p.y - cy;
      totalDist += Math.sqrt(dx*dx + dy*dy);
    });
    const avgDist = totalDist / strokePoints.length;

    let distVariance = 0;
    strokePoints.forEach(p => {
      const dx = p.x - cx;
      const dy = p.y - cy;
      const d = Math.sqrt(dx*dx + dy*dy);
      distVariance += Math.pow(d - avgDist, 2);
    });
    const stdevDist = Math.sqrt(distVariance / strokePoints.length);
    const circularity = stdevDist / avgDist; // lower means more circular

    let prediction = 'HÌNH CHƯA RÕ';
    let confidence = 70;

    if (aspect > 3.8 || aspect < 0.26) {
      prediction = 'ĐƯỜNG THẲNG ➖';
      confidence = 92 + Math.random() * 5;
    } else {
      // Find top/bottom pixel distribution for Triangle
      let topHalfCount = 0;
      strokePoints.forEach(p => {
        if (p.y < cy) topHalfCount++;
      });
      const topRatio = topHalfCount / strokePoints.length;

      if (circularity < 0.15) {
        prediction = 'HÌNH TRÒN ⭕';
        confidence = 94 + Math.random() * 4;
      } else if (topRatio < 0.35) {
        // Pointing up triangle
        prediction = 'HÌNH TAM GIÁC 🔺';
        confidence = 88 + Math.random() * 6;
      } else {
        prediction = 'HÌNH VUÔNG ⬜';
        confidence = 85 + Math.random() * 10;
      }
    }

    // Run animation and update display
    animateNeuralNet();
    setTimeout(() => {
      w3PredVal.innerText = prediction;
      w3ConfFill.style.width = `${confidence}%`;
    }, 900);
  });

  // Resize listener to redraw SVG nodes correctly
  window.addEventListener('resize', initWidget3);
  initWidget3();


  // ==========================================
  // WIDGET 4: FIGMA/MIRO COLLABORATION SIM
  // ==========================================
  const w4UserBoard = document.getElementById('w4-board-user');
  const w4PeerBoard = document.getElementById('w4-board-peer');
  const w4MyCursor = document.getElementById('w4-my-cursor');
  const w4PeerCursor = document.getElementById('w4-peer-cursor');
  const w4AddStickerBtn = document.getElementById('w4-add-sticker-btn');
  const w4ClearBoardBtn = document.getElementById('w4-clear-board-btn');
  const w4ChatBox = document.getElementById('w4-chat-box');

  // Tracking cursors
  w4UserBoard.addEventListener('mousemove', (e) => {
    const rect = w4UserBoard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    w4MyCursor.style.left = `${x}px`;
    w4MyCursor.style.top = `${y}px`;

    // Simulated sync of my cursor to the peer board (with minor offset)
    const peerCursorCopy = w4PeerBoard.querySelector('#my-cursor-replica');
    if (!peerCursorCopy) {
      const replica = document.createElement('div');
      replica.id = 'my-cursor-replica';
      replica.className = 'w4-avatar-badge w4-cursor-1';
      replica.innerText = '🖱️ Huyền';
      replica.style.pointerEvents = 'none';
      w4PeerBoard.appendChild(replica);
    } else {
      peerCursorCopy.style.left = `${x}px`;
      peerCursorCopy.style.top = `${y}px`;
    }
  });

  w4UserBoard.addEventListener('mouseleave', () => {
    const replica = w4PeerBoard.querySelector('#my-cursor-replica');
    if (replica) replica.remove();
  });

  // Simulated peer cursor movement (Tuấn Anh)
  let khanhTargetX = 100;
  let khanhTargetY = 80;
  let khanhCurrentX = 50;
  let khanhCurrentY = 50;

  function updatePeerCursor() {
    // Linear interpolation to target
    khanhCurrentX += (khanhTargetX - khanhCurrentX) * 0.08;
    khanhCurrentY += (khanhTargetY - khanhCurrentY) * 0.08;

    w4PeerCursor.style.left = `${khanhCurrentX}px`;
    w4PeerCursor.style.top = `${khanhCurrentY}px`;

    // Also replicate on user's board
    const khanhReplica = w4UserBoard.querySelector('#khanh-cursor-replica');
    if (!khanhReplica) {
      const replica = document.createElement('div');
      replica.id = 'khanh-cursor-replica';
      replica.className = 'w4-avatar-badge w4-cursor-2';
      replica.innerText = '🖱️ Tuấn Anh';
      replica.style.pointerEvents = 'none';
      w4UserBoard.appendChild(replica);
    } else {
      khanhReplica.style.left = `${khanhCurrentX}px`;
      khanhReplica.style.top = `${khanhCurrentY}px`;
    }

    if (Math.abs(khanhCurrentX - khanhTargetX) < 5) {
      khanhTargetX = Math.random() * (w4PeerBoard.clientWidth - 80);
      khanhTargetY = Math.random() * (w4PeerBoard.clientHeight - 40);
    }

    requestAnimationFrame(updatePeerCursor);
  }

  updatePeerCursor();

  // Chat messaging
  function addChatMessage(sender, text, isUser = false) {
    const msg = document.createElement('div');
    msg.className = 'w4-chat-msg';
    msg.innerHTML = `<span class="w4-chat-sender ${isUser ? 'w4-chat-user' : 'w4-chat-peer'}">${sender}:</span> ${text}`;
    w4ChatBox.appendChild(msg);
    w4ChatBox.scrollTop = w4ChatBox.scrollHeight;
  }

  // Adding sticker
  function dropSticker(board, x, y, text, color = '#fef08a') {
    const sticker = document.createElement('div');
    sticker.className = 'w4-board-sticker';
    sticker.innerText = text;
    sticker.style.left = `${x}px`;
    sticker.style.top = `${y}px`;
    sticker.style.background = color;
    board.appendChild(sticker);
  }

  w4AddStickerBtn.addEventListener('click', () => {
    // Add sticker at center or random
    const rx = Math.random() * 80 + 40;
    const ry = Math.random() * 80 + 30;
    const text = '💡 Kế Hoạch Số!';

    dropSticker(w4UserBoard, rx, ry, text);
    addChatMessage('Huyền', 'Vừa dán sticker ý tưởng lên bảng.', true);

    // Sync simulation delay
    setTimeout(() => {
      dropSticker(w4PeerBoard, rx, ry, text);
      addChatMessage('Tuấn Anh', 'Ồ, ý tưởng Kế Hoạch Số này hay quá!');
    }, 600);
  });

  // Allow clicking to drop sticker
  w4UserBoard.addEventListener('click', (e) => {
    if (e.target !== w4UserBoard) return; // ignore clicked stickers
    const rect = w4UserBoard.getBoundingClientRect();
    const x = e.clientX - rect.left - 40;
    const y = e.clientY - rect.top - 20;
    
    const text = '📌 Note Mới';
    dropSticker(w4UserBoard, x, y, text);
    
    setTimeout(() => {
      dropSticker(w4PeerBoard, x, y, text);
      addChatMessage('Tuấn Anh', 'Đã đồng bộ hóa phần ghi chú của bạn.');
    }, 500);
  });

  w4ClearBoardBtn.addEventListener('click', () => {
    w4UserBoard.querySelectorAll('.w4-board-sticker').forEach(s => s.remove());
    w4PeerBoard.querySelectorAll('.w4-board-sticker').forEach(s => s.remove());
    addChatMessage('Huyền', 'Đã làm sạch không gian làm việc.', true);
  });


  // ==========================================
  // WIDGET 5: CREATOR STUDIO (BANNER GEN)
  // ==========================================
  const w5Canvas = document.getElementById('w5-canvas');
  const w5Ctx = w5Canvas.getContext('2d');
  const w5Theme = document.getElementById('w5-theme-select');
  const w5TextInput = document.getElementById('w5-text-input');
  const w5Filter = document.getElementById('w5-filter-select');
  const w5Size = document.getElementById('w5-size-slider');
  const w5SizeVal = document.getElementById('w5-size-val');
  const w5DownloadBtn = document.getElementById('w5-download-btn');

  function initWidget5() {
    const theme = w5Theme.value;
    const text = w5TextInput.value;
    const size = parseInt(w5Size.value);
    
    // Draw background based on theme
    w5Ctx.clearRect(0, 0, w5Canvas.width, w5Canvas.height);
    
    if (theme === 'tech') {
      // Tech theme: Dark blue gradient with digital grid
      const grad = w5Ctx.createLinearGradient(0, 0, w5Canvas.width, w5Canvas.height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e1b4b');
      w5Ctx.fillStyle = grad;
      w5Ctx.fillRect(0, 0, w5Canvas.width, w5Canvas.height);
      
      // Grid lines
      w5Ctx.strokeStyle = 'rgba(0, 255, 255, 0.08)';
      w5Ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < w5Canvas.width; x += step) {
        w5Ctx.beginPath();
        w5Ctx.moveTo(x, 0);
        w5Ctx.lineTo(x, w5Canvas.height);
        w5Ctx.stroke();
      }
      for (let y = 0; y < w5Canvas.height; y += step) {
        w5Ctx.beginPath();
        w5Ctx.moveTo(0, y);
        w5Ctx.lineTo(w5Canvas.width, y);
        w5Ctx.stroke();
      }

      // Add circles glow
      w5Ctx.fillStyle = 'rgba(0, 255, 255, 0.05)';
      w5Ctx.beginPath();
      w5Ctx.arc(320, 80, 50, 0, Math.PI * 2);
      w5Ctx.fill();

      // Text colors
      w5Ctx.fillStyle = '#00ffff';
    } else if (theme === 'book') {
      // Book theme: Warm cozy amber gradient
      const grad = w5Ctx.createLinearGradient(0, 0, w5Canvas.width, w5Canvas.height);
      grad.addColorStop(0, '#78350f');
      grad.addColorStop(1, '#451a03');
      w5Ctx.fillStyle = grad;
      w5Ctx.fillRect(0, 0, w5Canvas.width, w5Canvas.height);

      // Book icon silhouette
      w5Ctx.fillStyle = 'rgba(245, 158, 11, 0.07)';
      w5Ctx.font = '70px sans-serif';
      w5Ctx.fillText('📚', 280, 160);

      w5Ctx.fillStyle = '#f59e0b';
    } else {
      // Art theme: Abstract cool gradients
      const grad = w5Ctx.createLinearGradient(0, 0, w5Canvas.width, w5Canvas.height);
      grad.addColorStop(0, '#4c1d95');
      grad.addColorStop(0.5, '#2563eb');
      grad.addColorStop(1, '#db2777');
      w5Ctx.fillStyle = grad;
      w5Ctx.fillRect(0, 0, w5Canvas.width, w5Canvas.height);

      // Waves
      w5Ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      w5Ctx.lineWidth = 3;
      w5Ctx.beginPath();
      w5Ctx.moveTo(0, 120);
      w5Ctx.bezierCurveTo(100, 50, 300, 200, 400, 120);
      w5Ctx.stroke();

      w5Ctx.fillStyle = '#ffffff';
    }

    // Draw primary typography text
    w5Ctx.font = `bold ${size}px 'Plus Jakarta Sans', sans-serif`;
    w5Ctx.textAlign = 'center';
    w5Ctx.textBaseline = 'middle';
    w5Ctx.shadowColor = 'rgba(0,0,0,0.5)';
    w5Ctx.shadowBlur = 6;
    w5Ctx.fillText(text, w5Canvas.width / 2, w5Canvas.height / 2 - 10);

    // Subtitle
    w5Ctx.shadowBlur = 0;
    w5Ctx.fillStyle = '#94a3b8';
    w5Ctx.font = `11px 'Inter', sans-serif`;
    w5Ctx.fillText('Nguyễn Thị Thanh Huyền • Portfolio 2026', w5Canvas.width / 2, w5Canvas.height / 2 + 25);

    // Apply Filter to CSS rendering
    applyCSSFilter();
  }

  function applyCSSFilter() {
    const filter = w5Filter.value;
    let cssFilterStr = 'none';
    if (filter === 'grayscale') cssFilterStr = 'grayscale(100%)';
    if (filter === 'sepia') cssFilterStr = 'sepia(80%)';
    if (filter === 'invert') cssFilterStr = 'invert(100%)';
    if (filter === 'blur') cssFilterStr = 'blur(2px)';
    w5Canvas.style.filter = cssFilterStr;
  }

  w5Theme.addEventListener('change', initWidget5);
  w5TextInput.addEventListener('input', initWidget5);
  w5Filter.addEventListener('change', initWidget5);
  
  w5Size.addEventListener('input', () => {
    w5SizeVal.innerText = `${w5Size.value}px`;
    initWidget5();
  });

  w5DownloadBtn.addEventListener('click', () => {
    // Generate temporary link
    const link = document.createElement('a');
    
    // Create secondary canvas to bake filter effects into downloaded file
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = w5Canvas.width;
    exportCanvas.height = w5Canvas.height;
    const expCtx = exportCanvas.getContext('2d');
    
    // Apply filters
    const filter = w5Filter.value;
    let filterString = 'none';
    if (filter === 'grayscale') filterString = 'grayscale(100%)';
    if (filter === 'sepia') filterString = 'sepia(80%)';
    if (filter === 'invert') filterString = 'invert(100%)';
    if (filter === 'blur') filterString = 'blur(2px)';
    
    expCtx.filter = filterString;
    expCtx.drawImage(w5Canvas, 0, 0);

    link.download = `Huyen_Banner_${w5Theme.value}.png`;
    link.href = exportCanvas.toDataURL();
    link.click();
  });

  // Init Studio Banner
  initWidget5();


  // ==========================================
  // WIDGET 6: SAFETY & INTEGRITY CHECK
  // ==========================================
  const w6PassInput = document.getElementById('w6-pass-input');
  const w6PassBar = document.getElementById('w6-pass-bar');
  const w6PassFeedback = document.getElementById('w6-pass-feedback');
  const w6PassTime = document.getElementById('w6-pass-time');

  w6PassInput.addEventListener('input', () => {
    const val = w6PassInput.value;
    if (!val) {
      w6PassBar.style.width = '0%';
      w6PassFeedback.innerText = 'Vui lòng nhập mật khẩu.';
      w6PassTime.innerText = '0 giây';
      return;
    }

    let score = 0;
    const criteria = {
      length: val.length >= 8,
      upper: /[A-Z]/.test(val),
      lower: /[a-z]/.test(val),
      digit: /[0-9]/.test(val),
      special: /[^A-Za-z0-9]/.test(val)
    };

    let criteriaMet = 0;
    if (criteria.length) score += 20;
    if (criteria.upper) { score += 20; criteriaMet++; }
    if (criteria.lower) { score += 20; criteriaMet++; }
    if (criteria.digit) { score += 20; criteriaMet++; }
    if (criteria.special) { score += 20; criteriaMet++; }

    w6PassBar.style.width = `${score}%`;

    // Map Color and crack time
    let feedback = '';
    let timeVal = '';
    let barColor = 'var(--error)';

    if (score <= 40) {
      feedback = '🔴 Mật khẩu YẾU! Nên thêm chữ hoa, số và dài hơn 8 ký tự.';
      timeVal = 'Vài mili-giây ⚡';
      barColor = 'var(--error)';
    } else if (score <= 70) {
      feedback = '🟠 Mật khẩu TRUNG BÌNH. Hãy thêm ký tự đặc biệt (@, #, $...).';
      timeVal = '5 phút ⏱️';
      barColor = 'var(--accent)';
    } else if (score < 100) {
      feedback = '🟡 Mật khẩu MẠNH. Đủ điều kiện bảo mật.';
      timeVal = '12 năm 🔒';
      barColor = 'var(--primary)';
    } else {
      feedback = '🟢 Mật khẩu CỰC MẠNH! Độ an toàn tuyệt đối.';
      timeVal = '10,000+ năm 🛡️';
      barColor = 'var(--success)';
    }

    w6PassBar.style.background = barColor;
    w6PassFeedback.innerHTML = feedback;
    w6PassTime.innerText = timeVal;
  });

  // Citation generator
  const citeAuthor = document.getElementById('w6-cite-author');
  const citeTitle = document.getElementById('w6-cite-title');
  const citeYear = document.getElementById('w6-cite-year');
  const genApaBtn = document.getElementById('w6-gen-apa');
  const genMlaBtn = document.getElementById('w6-gen-mla');
  const citeText = document.getElementById('w6-cite-text');
  const copyBtn = document.getElementById('w6-copy-btn');

  function getCitationFields() {
    const author = citeAuthor.value.trim() || "Nguyễn Văn A";
    const title = citeTitle.value.trim() || "Nhập môn Công nghệ số và AI";
    const year = citeYear.value.trim() || "2026";
    return { author, title, year };
  }

  genApaBtn.addEventListener('click', () => {
    const data = getCitationFields();
    // APA format: Author, A. A. (Year). Title.
    // Parse author name initials
    const words = data.author.split(' ');
    const lastName = words[words.length - 1];
    const initials = words.slice(0, words.length - 1).map(w => w[0] + '.').join(' ');
    
    citeText.innerText = `${lastName}, ${initials} (${data.year}). ${data.title}. NXB Đại Học Quốc Gia.`;
  });

  genMlaBtn.addEventListener('click', () => {
    const data = getCitationFields();
    // MLA format: Author. Title. Publisher, Year.
    citeText.innerText = `${data.author}. "${data.title}." Nhà Xuất Bản Tri Thức, ${data.year}.`;
  });

  copyBtn.addEventListener('click', () => {
    const text = citeText.innerText;
    if (text.includes("Trích dẫn tạo sẵn")) return;

    navigator.clipboard.writeText(text).then(() => {
      copyBtn.innerText = 'Đã chép!';
      copyBtn.style.background = 'var(--success)';
      copyBtn.style.color = 'var(--bg-dark-core)';
      
      setTimeout(() => {
        copyBtn.innerText = 'Sao chép';
        copyBtn.style.background = 'rgba(255,255,255,0.05)';
        copyBtn.style.color = 'var(--text-secondary)';
      }, 1500);
    });
  });


  // ==========================================
  // GUESTBOOK FORM WIDGET
  // ==========================================
  const gbForm = document.getElementById('guestbook-form');
  const gbName = document.getElementById('gb-name');
  const gbMsg = document.getElementById('gb-msg');
  const gbList = document.getElementById('guestbook-list');

  // Load comments from LocalStorage
  const storageKey = 'huyen_portfolio_comments';
  let comments = [];

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) comments = JSON.parse(stored);
  } catch (e) {
    console.error("Local storage error: ", e);
  }

  function renderComments() {
    // Keep the hardcoded tutor review first
    const teacherHtml = `<div class="guestbook-item">
      <div class="guestbook-meta">
        <span class="guestbook-author">Giảng viên hướng dẫn</span>
        <span>Vừa xong</span>
      </div>
      <div class="guestbook-text">Portfolio thiết kế rất chỉn chu, các widget tương tác rất sáng tạo và phản ánh chính xác mục tiêu của từng bài học! Điểm cộng lớn cho tính thẩm mỹ và trực quan.</div>
    </div>`;

    gbList.innerHTML = teacherHtml;

    comments.forEach(c => {
      const item = document.createElement('div');
      item.className = 'guestbook-item';
      item.innerHTML = `<div class="guestbook-meta">
        <span class="guestbook-author">${escapeHtml(c.name)}</span>
        <span>${escapeHtml(c.time)}</span>
      </div>
      <div class="guestbook-text">${escapeHtml(c.msg)}</div>`;
      gbList.appendChild(item);
    });
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  gbForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = gbName.value.trim();
    const msg = gbMsg.value.trim();

    if (!name || !msg) return;

    const newComment = {
      name,
      msg,
      time: '1 phút trước'
    };

    comments.unshift(newComment); // Add new comments at the top

    try {
      localStorage.setItem(storageKey, JSON.stringify(comments));
    } catch(err) {
      console.error(err);
    }

    renderComments();

    gbName.value = '';
    gbMsg.value = '';
  });

  // Initial load
  renderComments();

});
