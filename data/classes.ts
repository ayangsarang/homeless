export type WorkType = "image" | "audio" | "video";

export type Work = {
  id: string;
  type: WorkType;
  title: string;
  url: string;
  description: string;
  audioDescriptionUrl?: string;
  signLanguageUrl?: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Student = {
  id: string;
  name: string;
  emoji: string;
  works: Work[];
  x: number;
  y: number;
};

export type ClassRoom = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  signLanguageUrl: string;
  audioDescriptionUrl: string;
  students: Student[];
};

const SAMPLE_AUDIO = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const SAMPLE_SIGN_YT = "https://www.youtube.com/watch?v=7gPgHksk_Ec";

const STUDENT_NAMES = [
  ["김영수", "박정희", "이순자", "최복남", "정만수"],
  ["오태식", "한미숙", "강철수", "윤옥희", "조명자"],
  ["임봉규", "신영자", "남기웅", "황순분", "고경자"],
  ["문재석", "배옥순", "백남진", "서금자", "허영민"],
  ["송춘식", "권말숙", "안동수", "노점례", "민병호"],
  ["유달자", "전봉수", "장길자", "심정희", "표만호"],
  ["하영순", "구만석", "도순분", "마영자", "변삼식"],
  ["사봉희", "양춘자", "엄두식", "여순녀", "왕만수"],
  ["우정자", "원봉남", "유삼식", "은옥자", "주영순"],
  ["진말순", "차봉수", "추정자", "탁만석", "팽순분"],
];

const CLASS_DEFS = [
  { name: "우리말 쓰기 반", desc: "한글을 처음 배우는 반입니다.", emoji: "✏️", color: "#FFD6A5" },
  { name: "그림 반", desc: "마음을 그림으로 표현해요.", emoji: "🎨", color: "#FDFFB6" },
  { name: "노래 반", desc: "함께 노래를 부릅니다.", emoji: "🎵", color: "#CAFFBF" },
  { name: "사진 반", desc: "내 일상을 사진으로 남깁니다.", emoji: "📷", color: "#9BF6FF" },
  { name: "시 쓰기 반", desc: "마음의 이야기를 시로 씁니다.", emoji: "📝", color: "#A0C4FF" },
  { name: "요리 반", desc: "함께 만들어 함께 먹어요.", emoji: "🍲", color: "#BDB2FF" },
  { name: "컴퓨터 반", desc: "컴퓨터와 친해지는 시간.", emoji: "💻", color: "#FFC6FF" },
  { name: "역사 반", desc: "우리가 살아온 이야기를 배웁니다.", emoji: "📚", color: "#FFADAD" },
  { name: "춤 반", desc: "몸으로 표현하는 즐거움.", emoji: "💃", color: "#FFD6E0" },
  { name: "수다 반", desc: "서로의 이야기를 들어주는 시간.", emoji: "💬", color: "#E4C1F9" },
];

const WORK_TYPES: WorkType[] = ["image", "audio", "video"];

function makeWorks(classIdx: number, studentIdx: number): Work[] {
  const works: Work[] = [];
  for (let i = 0; i < 3; i++) {
    const type = WORK_TYPES[i];
    const seed = classIdx * 100 + studentIdx * 10 + i;
    const w: Work = {
      id: `c${classIdx}-s${studentIdx}-w${i}`,
      type,
      title:
        type === "image"
          ? `그림 ${i + 1}`
          : type === "audio"
            ? `목소리 ${i + 1}`
            : `영상 ${i + 1}`,
      url:
        type === "image"
          ? `https://picsum.photos/seed/${seed}/600/400`
          : type === "audio"
            ? SAMPLE_AUDIO
            : SAMPLE_VIDEO,
      description: `${CLASS_DEFS[classIdx].name}에서 ${STUDENT_NAMES[classIdx][studentIdx]} 학생이 만든 ${type === "image" ? "그림" : type === "audio" ? "목소리 녹음" : "영상"}입니다.`,
      audioDescriptionUrl: SAMPLE_AUDIO,
      signLanguageUrl: SAMPLE_SIGN_YT,
      x: 0,
      y: 0,
      width: 280,
      height: 200,
    };
    works.push(w);
  }
  return works;
}

const STUDENT_EMOJIS = ["🌻", "🌸", "🌳", "🌙", "⭐"];

// 학생 1명의 footprint:
//   - 이름표: baseX, baseY (높이 ~80)
//   - 작업물 3개: 가로 280 × 3개 + 간격 40 × 2 = 920, 세로 200
//     baseX..baseX+920, baseY+100..baseY+300
// 따라서 학생 간 가로 1100, 세로 500 간격으로 배치 → 안 겹침
function makeStudents(classIdx: number): Student[] {
  const positions = [
    { x: 100, y: 100 },
    { x: 1200, y: 100 },
    { x: 2300, y: 100 },
    { x: 650, y: 700 },
    { x: 1750, y: 700 },
  ];
  return STUDENT_NAMES[classIdx].map((name, idx) => {
    const works = makeWorks(classIdx, idx);
    const baseX = positions[idx].x;
    const baseY = positions[idx].y;
    works.forEach((w, wi) => {
      w.x = baseX + wi * 320;
      w.y = baseY + 100;
    });
    return {
      id: `c${classIdx}-s${idx}`,
      name,
      emoji: STUDENT_EMOJIS[idx],
      works,
      x: baseX,
      y: baseY,
    };
  });
}

export const CLASSES: ClassRoom[] = CLASS_DEFS.map((def, idx) => ({
  id: `class-${idx}`,
  name: def.name,
  description: def.desc,
  emoji: def.emoji,
  color: def.color,
  signLanguageUrl: SAMPLE_SIGN_YT,
  audioDescriptionUrl: SAMPLE_AUDIO,
  students: makeStudents(idx),
}));

export function getClassById(id: string): ClassRoom | undefined {
  return CLASSES.find((c) => c.id === id);
}
