import jsPDF from "jspdf";

const prettyEmotion = (value) => {
  if (!value) return "—";
  const normalized = String(value).toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const getPct = (session, key) => {
  const percentages = session?.emotion_percentages || {};
  return (
    percentages[key] ??
    percentages[key.toLowerCase()] ??
    percentages[key.charAt(0).toUpperCase() + key.slice(1)] ??
    0
  );
};

const safeText = (value) => String(value ?? "—");

const formatDateTime = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
};

const COLORS = {
  brand: [29, 185, 84],
  brandDark: [20, 20, 20],
  text: [28, 28, 28],
  muted: [110, 110, 110],
  line: [225, 225, 225],
  lightCard: [248, 249, 251],

  happy: [34, 197, 94],
  sad: [59, 130, 246],
  angry: [239, 68, 68],
  fear: [234, 179, 8],

  stableBg: [234, 248, 238],
  stableBorder: [180, 230, 200],
  stableText: [22, 101, 52],

  monitorBg: [235, 244, 255],
  monitorBorder: [190, 220, 255],
  monitorText: [29, 78, 216],

  attentionBg: [255, 248, 230],
  attentionBorder: [250, 225, 150],
  attentionText: [161, 98, 7],

  concernBg: [254, 242, 242],
  concernBorder: [252, 195, 195],
  concernText: [185, 28, 28],
};

const addWrappedText = (doc, text, x, y, maxWidth, lineHeight = 5) => {
  const lines = doc.splitTextToSize(String(text || ""), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
};

const ensurePageSpace = (doc, y, needed = 20, top = 18) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - 15) {
    doc.addPage();
    return top;
  }
  return y;
};

const drawPageFooter = (doc) => {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLORS.line);
    doc.line(14, pageHeight - 10, pageWidth - 14, pageHeight - 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.muted);
    doc.text("M_Track • Face-Based Well-Being Report", 14, pageHeight - 5);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 5, {
      align: "right",
    });
  }
};

const drawHeader = (doc, title, subtitle, generatedOn) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...COLORS.brandDark);
  doc.roundedRect(10, 10, pageWidth - 20, 30, 4, 4, "F");

  doc.setFillColor(...COLORS.brand);
  doc.roundedRect(10, 10, 8, 30, 2, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("M_Track", 22, 22);

  doc.setFontSize(13);
  doc.text(title, 22, 30);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(210, 210, 210);
  doc.text(subtitle, 22, 36);
  doc.text(`Generated on: ${generatedOn}`, pageWidth - 16, 36, { align: "right" });
};

const drawSectionTitle = (doc, title, y, color = COLORS.brand) => {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, y - 5, pageWidth - 28, 10, 2, 2, "F");
  doc.setFillColor(...color);
  doc.roundedRect(14, y - 5, 4, 10, 1, 1, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.text);
  doc.text(title, 22, y + 1);

  return y + 12;
};

const drawInfoRow = (doc, label, value, y, labelWidth = 48) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.muted);
  doc.text(`${label}:`, 16, y);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.text);
  doc.text(safeText(value), 16 + labelWidth, y);

  return y + 6;
};

const getStatusTheme = (label) => {
  if (label === "Stable") {
    return {
      bg: COLORS.stableBg,
      border: COLORS.stableBorder,
      text: COLORS.stableText,
    };
  }
  if (label === "Monitor") {
    return {
      bg: COLORS.monitorBg,
      border: COLORS.monitorBorder,
      text: COLORS.monitorText,
    };
  }
  if (label === "Needs Attention") {
    return {
      bg: COLORS.attentionBg,
      border: COLORS.attentionBorder,
      text: COLORS.attentionText,
    };
  }
  return {
    bg: COLORS.concernBg,
    border: COLORS.concernBorder,
    text: COLORS.concernText,
  };
};

const drawSummaryBox = (doc, x, y, w, h, title, value, tone = "neutral") => {
  let fill = COLORS.lightCard;
  let titleColor = COLORS.muted;
  let valueColor = COLORS.text;

  if (tone === "green") {
    fill = COLORS.stableBg;
    titleColor = [70, 120, 90];
    valueColor = COLORS.stableText;
  } else if (tone === "blue") {
    fill = COLORS.monitorBg;
    titleColor = [70, 100, 150];
    valueColor = COLORS.monitorText;
  } else if (tone === "yellow") {
    fill = COLORS.attentionBg;
    titleColor = [140, 120, 50];
    valueColor = COLORS.attentionText;
  } else if (tone === "red") {
    fill = COLORS.concernBg;
    titleColor = [150, 80, 80];
    valueColor = COLORS.concernText;
  }

  doc.setFillColor(...fill);
  doc.roundedRect(x, y, w, h, 3, 3, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...titleColor);
  doc.text(title, x + 4, y + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...valueColor);
  doc.text(String(value), x + 4, y + 16);
};

const drawStatusCard = (doc, y, supportAssessment) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const width = pageWidth - 28;
  const theme = getStatusTheme(supportAssessment?.status?.label);

  doc.setFillColor(...theme.bg);
  doc.setDrawColor(...theme.border);
  doc.roundedRect(14, y, width, 34, 4, 4, "FD");

  doc.setFillColor(...theme.text);
  doc.roundedRect(14, y, 6, 34, 2, 2, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.muted);
  doc.text("OVERALL EARLY-SUPPORT RESULT", 24, y + 8);

  doc.setFontSize(20);
  doc.setTextColor(...theme.text);
  doc.text(safeText(supportAssessment?.status?.label), 24, y + 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  doc.text(`Concern Score: ${supportAssessment?.score ?? 0}/100`, 24, y + 26);

  return y + 40;
};

const getEmotionBarColor = (emotion) => {
  const key = String(emotion || "").toLowerCase();
  if (key === "happy") return COLORS.happy;
  if (key === "sad") return COLORS.sad;
  if (key === "angry") return COLORS.angry;
  if (key === "fear") return COLORS.fear;
  return [120, 120, 120];
};

const drawEmotionBar = (doc, x, y, width, label, value, color) => {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text(label, x, y);

  doc.setTextColor(...COLORS.text);
  doc.text(`${value}%`, x + width, y, { align: "right" });

  const barY = y + 3;
  doc.setFillColor(235, 235, 235);
  doc.roundedRect(x, barY, width, 4, 1.5, 1.5, "F");

  const filled = Math.max(0, Math.min(width, (width * value) / 100));
  doc.setFillColor(...color);
  doc.roundedRect(x, barY, filled, 4, 1.5, 1.5, "F");

  return y + 10;
};

const getToneFromStatus = (label) => {
  if (label === "Stable") return "green";
  if (label === "Monitor") return "blue";
  if (label === "Needs Attention") return "yellow";
  if (label === "Higher Concern") return "red";
  return "neutral";
};

export const generateFaceHistoryPdfReport = ({
  user,
  history,
  supportAssessment,
  todaySummary,
}) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 46;

  drawHeader(
    doc,
    "Face-Based Well-Being Overview Report",
    "Early-support indicator generated from recent facial emotion session data",
    new Date().toLocaleString()
  );

  y = drawSectionTitle(doc, "Student Information", y, COLORS.brand);
  y = drawInfoRow(doc, "User", user?.email || "Unknown User", y);
  y = drawInfoRow(doc, "Role", user?.role || "User", y);
  y += 4;

  y = ensurePageSpace(doc, y, 60);
  y = drawSectionTitle(doc, "Overall Result", y, COLORS.brand);
  y = drawStatusCard(doc, y, supportAssessment);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  y = addWrappedText(
    doc,
    supportAssessment?.status?.description || "No interpretation available.",
    16,
    y,
    pageWidth - 32
  );
  y += 2;
  y = addWrappedText(
    doc,
    supportAssessment?.message || "",
    16,
    y,
    pageWidth - 32
  );
  y += 8;

  y = ensurePageSpace(doc, y, 30);
  y = drawSectionTitle(doc, "Summary Metrics", y, COLORS.brand);

  const boxY = y;
  const gap = 4;
  const boxW = (pageWidth - 28 - gap * 3) / 4;

  drawSummaryBox(
    doc,
    14,
    boxY,
    boxW,
    22,
    "Concern Score",
    `${supportAssessment?.score ?? 0}/100`,
    getToneFromStatus(supportAssessment?.status?.label)
  );
  drawSummaryBox(
    doc,
    14 + boxW + gap,
    boxY,
    boxW,
    22,
    "Support Zone",
    supportAssessment?.status?.label || "—",
    getToneFromStatus(supportAssessment?.status?.label)
  );
  drawSummaryBox(doc, 14 + (boxW + gap) * 2, boxY, boxW, 22, "Total Sessions", history?.total ?? 0, "neutral");
  drawSummaryBox(
    doc,
    14 + (boxW + gap) * 3,
    boxY,
    boxW,
    22,
    "This Week",
    history?.weekly_summary?.total_sessions_this_week ?? 0,
    "neutral"
  );

  y += 28;

  y = ensurePageSpace(doc, y, 50);
  y = drawSectionTitle(doc, "Average Emotional Pattern From Recent Sessions", y, COLORS.brand);

  y = drawEmotionBar(doc, 16, y, pageWidth - 32, "Happy", supportAssessment?.avg?.happy ?? 0, COLORS.happy);
  y = drawEmotionBar(doc, 16, y, pageWidth - 32, "Sad", supportAssessment?.avg?.sad ?? 0, COLORS.sad);
  y = drawEmotionBar(doc, 16, y, pageWidth - 32, "Angry", supportAssessment?.avg?.angry ?? 0, COLORS.angry);
  y = drawEmotionBar(doc, 16, y, pageWidth - 32, "Fear", supportAssessment?.avg?.fear ?? 0, COLORS.fear);
  y += 4;

  y = ensurePageSpace(doc, y, 25);
  y = drawSectionTitle(doc, "Today Snapshot", y, COLORS.brand);
  y = drawInfoRow(doc, "Sessions Today", todaySummary?.sessions ?? 0, y);
  y = drawInfoRow(doc, "Dominant Emotion Today", prettyEmotion(todaySummary?.top_emotion), y);
  y += 4;

  y = ensurePageSpace(doc, y, 25);
  y = drawSectionTitle(doc, "Weekly Observation Window", y, COLORS.brand);

  if (history?.weekly_summary?.days?.length) {
    history.weekly_summary.days.forEach((day) => {
      y = ensurePageSpace(doc, y, 12);

      doc.setFillColor(...COLORS.lightCard);
      doc.roundedRect(14, y - 4, pageWidth - 28, 10, 2, 2, "F");

      doc.setFillColor(...COLORS.brand);
      doc.roundedRect(14, y - 4, 3, 10, 1, 1, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...COLORS.text);
      doc.text(day.date, 20, y + 1);

      doc.setFont("helvetica", "normal");
      doc.text(`Sessions: ${day.sessions}`, 70, y + 1);
      doc.text(`Dominant Emotion: ${prettyEmotion(day.top_emotion)}`, 120, y + 1);

      y += 12;
    });
  } else {
    y = drawInfoRow(doc, "Weekly Data", "No weekly records available", y);
  }

  y += 2;

  y = ensurePageSpace(doc, y, 30);
  y = drawSectionTitle(doc, "Detailed Session Evidence", y, COLORS.brand);

  if (history?.sessions?.length) {
    history.sessions.forEach((session, index) => {
      y = ensurePageSpace(doc, y, 50);

      const happy = getPct(session, "happy");
      const sad = getPct(session, "sad");
      const angry = getPct(session, "angry");
      const fear = getPct(session, "fear");
      const negativeLoad = Math.min(100, sad + angry + fear);

      doc.setFillColor(252, 252, 252);
      doc.setDrawColor(...COLORS.line);
      doc.roundedRect(14, y, pageWidth - 28, 40, 3, 3, "FD");

      doc.setFillColor(...COLORS.brand);
      doc.roundedRect(14, y, 4, 40, 1, 1, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...COLORS.text);
      doc.text(`Session ${index + 1}`, 20, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.muted);
      doc.text(`Recorded: ${formatDateTime(session.created_at)}`, 20, y + 13);
      doc.text(`Dominant Emotion: ${prettyEmotion(session.dominant_emotion)}`, 20, y + 18);
      doc.text(`Duration: ${Math.round(session.duration_seconds / 60)} min`, 20, y + 23);
      doc.text(`Detections: ${session.total_detections}`, 20, y + 28);

      doc.setTextColor(...COLORS.happy);
      doc.text(`Happy: ${happy}%`, 112, y + 13);
      doc.setTextColor(...COLORS.sad);
      doc.text(`Sad: ${sad}%`, 112, y + 18);
      doc.setTextColor(...COLORS.angry);
      doc.text(`Angry: ${angry}%`, 112, y + 23);
      doc.setTextColor(...COLORS.fear);
      doc.text(`Fear: ${fear}%`, 112, y + 28);
      doc.setTextColor(...COLORS.text);
      doc.text(`Negative Load: ${negativeLoad}%`, 112, y + 33);

      y += 46;
    });
  } else {
    y = drawInfoRow(doc, "Sessions", "No saved face emotion sessions yet", y);
  }

  y = ensurePageSpace(doc, y, 30);
  y = drawSectionTitle(doc, "Important Note", y, COLORS.brand);

  doc.setFillColor(248, 249, 251);
  doc.roundedRect(14, y - 2, pageWidth - 28, 22, 3, 3, "F");
  doc.setFillColor(...COLORS.brand);
  doc.roundedRect(14, y - 2, 4, 22, 1, 1, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.muted);
  addWrappedText(
    doc,
    "This report is generated by M_Track as an early-support indicator using recent facial emotion session data. It is not a clinical diagnosis and should be interpreted together with other project modules, repeated observations, and human review.",
    20,
    y + 4,
    pageWidth - 40
  );

  drawPageFooter(doc);

  const fileName = `M_Track_Face_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
};