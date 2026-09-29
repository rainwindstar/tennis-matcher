import React, { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';
import { insforge } from './insforgeClient';
import {
  Users, UserPlus, Trophy, BarChart3, History, CheckCircle2,
  CalendarDays, Target, Flame, Edit2, Trash2, Plus, Save, X, Camera, Crown
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';

const MEMBER_PHOTOS = {
  '강경호': '/photos/강경호.jpg',
  '김관우': '/photos/김관우.jpg',
  '김두수': '/photos/김두수.jpg',
  '박천욱': '/photos/박천욱.jpg',
  '서영교': '/photos/서영교.jpg',
  '오세구': '/photos/오세구.jpg',
  '이장민': '/photos/이장민.jpg',
  '이훈준': '/photos/이훈준.jpg',
  '최성부': '/photos/최성부.jpg',
  '안경효': '/photos/안경효.jpg',
  '이동덕': '/photos/이동덕.jpg',
};

const MemberAvatar = ({ photo, name, size = 60 }) => {
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto', border: '2px solid rgba(255,255,255,0.8)' }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto', fontSize: Math.floor(size * 0.38), fontWeight: '800', color: 'white',
    }}>
      {name.charAt(0)}
    </div>
  );
};

const DEFAULT_MEMBERS = [
  '강경호', '김두수', '서영교', '김관우', '오세구',
  '이장민', '박천욱', '이동덕', '이훈준', '최성부', '안경효'
];

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// 승률 구간별 TMI 코멘트 풀 50개 — 분기(Q1~Q4)별로 시작 오프셋이 달라져 계절마다 다른 코멘트가 먼저 나옴
const ALL_FUN_COMMENTS = {
  none: [
    '아직 몸 풀기 중... 오늘의 다크호스 대기 중 🐴',
    '워밍업 모드 ON. 진짜 실력은 지금부터 🎯',
    '경기 전 신비주의 전략? 모두가 주목 중 👀',
    '아직 베일에 싸인 실력... 오늘 공개 예정 🎭',
    '코트 적응 중. 라켓과 친해지는 시간 필요 🤝',
    '등장 전 충전 완료 중... 배터리 100% 🔋',
  ],
  high: [
    '오늘 라켓에 GPS 달았나요? 공이 다 찾아가네 🎯',
    '혹시 어젯밤 코트에서 혼자 연습했나요? 왜 이렇게 잘해 😤',
    '상대팀이 네트 넘기 두려워하는 게 느껴진다 🏆',
    '이 분 맞은 공은 심판도 "어?" 하는 중 😮',
    '승리요정이 아니라 승리천사급! 하늘에서 내려왔나요 🏅',
    '오늘 모든 공이 "저 잡아주세요" 하며 오는 것 같음 🎾',
    '코트 위의 지배자. 상대방 선글라스가 반사되는 중 😎',
    '저 사람 라켓에 AI 칩 박혀있는 거 아닌가요? 🤖',
    '완벽한 폼, 완벽한 샷. 오늘 최강자 인정 👑',
    '테니스 신이 강림하셨습니다. 모두 경배 🙏',
  ],
  midHigh: [
    '상승세 미쳤다! 오늘 분위기 심상치 않음 🔥',
    '연승 본능이 각성 중. 다음 상대 조심해! 💪',
    '컨디션 100점 만점에 99점. 나머지 1점은 겸손 😏',
    '이기는 맛 아는 사람 특유의 여유로움 ✨',
    '오늘 서브 들어갈 때마다 상대팀 한숨 소리 들림 😅',
    '실력 상향 중! 다음 달엔 코치 자격증 따실 기세 📜',
    '코트 위 센터포워드. 볼 배급도 남다르다 🎯',
    '오늘 경기 영상 찍어두는 거 추천. 나중에 팔 수 있음 📹',
  ],
  even: [
    '이기고 지고... 코트 위 인생 철학자 ⚖️',
    '승과 패 사이 완벽한 균형의 미학 🧘',
    '반반 치킨 같은 오늘의 성적. 근데 맛있잖아요 🍗',
    '이분 혹시 승률 50% 유지가 목표인가요? 놀랍도록 정확함 🎪',
    '오늘 코트 위의 시소게임 담당. 절묘한 균형 🎭',
    '이기고 지는 게 반반인데 왜 이렇게 쿨해 보이지? 😎',
    '코트의 음양 조화. 이기면 좋고 져도 쿨한 자태 ☯️',
    '50% 승률... 혹시 상대방 배려하는 건가요? 🤔',
  ],
  midLow: [
    '착실히 내공 쌓는 중. 다음 게임은 반드시 다름 💪',
    '오늘은 연습, 다음엔 실전! 데이터 수집 완료 📊',
    '괜찮아요, 나달도 매번 이긴 건 아니에요 (아마도) 😌',
    '지금 지고 있지만 표정은 이미 승리자 같음 😄',
    '오늘 진 게임에서 배운 것이 이긴 게임보다 많은 법 📚',
    '패배를 거름 삼아 내일 꽃 피울 예정 🌸',
    '현재 재충전 중. 배터리 충전량 47% 🔋',
    '미래의 MVP가 지금 열심히 패배를 맛보고 있는 중 👀',
    '오늘 컨디션이 살짝... 근데 표정만은 에이스 😤',
    '다음 게임에서 오늘 설욕 기대됩니다! 🎯',
  ],
  low: [
    '오늘은 컨디션이 좀... 코트의 신이 잠시 휴가 중 🏖️',
    '공이 자꾸 다른 코트로 놀러 가는 중 🏃',
    '오늘만 날인가요, 내일은 분명 다를 겁니다! 🌅',
    '라켓이 먼저 항복 선언을 했나봐요 🏳️',
    '오늘 날씨 탓으로 돌리고 싶은 심정 아닌가요? 🌧️',
    '코트가 오늘따라 이상하게 기울어진 느낌 🤔',
    '다음 게임 멋지게 설욕전 가즈아! 🔥',
    '오늘 진 것보다 앞으로 이길 게 더 많습니다 화이팅 💙',
  ],
};

export default function App() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [attendees, setAttendees] = useState(() => {
    const saved = localStorage.getItem('tennis_attendees');
    return saved ? JSON.parse(saved) : [];
  });
  const [guestName, setGuestName] = useState('');

  const [matchDate, setMatchDate] = useState(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const saved = localStorage.getItem('tennis_matchDate');
    return (saved === today) ? saved : today;
  });

  // Core members (editable)
  const [coreMembers, setCoreMembers] = useState(() => {
    const saved = localStorage.getItem('tennis_coreMembers');
    return saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
  });
  const [isMemberEditMode, setIsMemberEditMode] = useState(false);
  const [editingMemberIdx, setEditingMemberIdx] = useState(null);
  const [editingMemberName, setEditingMemberName] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState(() => {
    const saved = localStorage.getItem('tennis_memberPhotos');
    return saved ? JSON.parse(saved) : {};
  });
  
  // Schedule state
  const [schedule, setSchedule] = useState(() => {
    const saved = localStorage.getItem('tennis_schedule');
    return saved ? JSON.parse(saved) : [];
  });
  const [scheduleGenerated, setScheduleGenerated] = useState(() => {
    const saved = localStorage.getItem('tennis_scheduleGenerated');
    return saved ? JSON.parse(saved) : false;
  });
  const [savingMatchId, setSavingMatchId] = useState(null);
  
  // Live Scoreboard state
  const [liveMatchId, setLiveMatchId] = useState(() => {
    const saved = localStorage.getItem('tennis_liveMatchId');
    return saved ? JSON.parse(saved) : null;
  });
  const [livePoints, setLivePoints] = useState(() => {
    const saved = localStorage.getItem('tennis_livePoints');
    return saved ? JSON.parse(saved) : { A: 0, B: 0 };
  });
  const POINT_VALUES = ['0', '15', '30', '40', 'AD'];

  // Tiebreak state
  const [isTiebreak, setIsTiebreak] = useState(() => {
    const saved = localStorage.getItem('tennis_isTiebreak');
    return saved ? JSON.parse(saved) : false;
  });
  const [tiebreakPoints, setTiebreakPoints] = useState(() => {
    const saved = localStorage.getItem('tennis_tiebreakPoints');
    return saved ? JSON.parse(saved) : { A: 0, B: 0 };
  });
  
  // Schedule edit state
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [editMatchData, setEditMatchData] = useState(null);
  
  // 구글 시트 웹앱 URL (사용자가 스크립트 배포 후 여기에 입력)
  const GOOGLE_SHEET_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbykBfHos2qYIjppp0Dut-ILnYVsDAoUIOhmuUobgaAvn9QV4-fqJQTXjEOP6X_MvaEkRg/exec'; 

  
  // Dashboard stats
  const [completedMatches, setCompletedMatches] = useState(() => {
    const saved = localStorage.getItem('tennis_completedMatches');
    return saved ? JSON.parse(saved) : [];
  });
  const [playerStats, setPlayerStats] = useState({});

  useEffect(() => {
    localStorage.setItem('tennis_attendees', JSON.stringify(attendees));
  }, [attendees]);

  useEffect(() => {
    localStorage.setItem('tennis_coreMembers', JSON.stringify(coreMembers));
  }, [coreMembers]);

  useEffect(() => {
    localStorage.setItem('tennis_matchDate', matchDate);
  }, [matchDate]);

  useEffect(() => {
    localStorage.setItem('tennis_memberPhotos', JSON.stringify(uploadedPhotos));
  }, [uploadedPhotos]);

  const startEditMember = (idx) => {
    setEditingMemberIdx(idx);
    setEditingMemberName(coreMembers[idx]);
  };

  const saveEditMember = (idx) => {
    const trimmed = editingMemberName.trim();
    if (!trimmed) return;
    const oldName = coreMembers[idx];
    setCoreMembers(prev => prev.map((m, i) => i === idx ? trimmed : m));
    // 출석 명단에서도 이름 업데이트
    setAttendees(prev => prev.map(a => a === oldName ? trimmed : a));
    setEditingMemberIdx(null);
    setEditingMemberName('');
  };

  const deleteMember = (idx) => {
    const name = coreMembers[idx];
    setCoreMembers(prev => prev.filter((_, i) => i !== idx));
    setAttendees(prev => prev.filter(a => a !== name));
    if (editingMemberIdx === idx) setEditingMemberIdx(null);
  };

  const addCoreMember = (e) => {
    e.preventDefault();
    const trimmed = newMemberName.trim();
    if (!trimmed || coreMembers.includes(trimmed)) return;
    setCoreMembers(prev => [...prev, trimmed]);
    setNewMemberName('');
  };

  const getMemberPhoto = (name) => uploadedPhotos[name] || MEMBER_PHOTOS[name] || null;

  const handlePhotoUpload = (memberName, file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const size = 400;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const scale = Math.max(size / img.width, size / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      ctx.drawImage(img, (size - sw) / 2, (size - sh) / 2, sw, sh);
      URL.revokeObjectURL(url);
      setUploadedPhotos(prev => ({ ...prev, [memberName]: canvas.toDataURL('image/jpeg', 0.85) }));
    };
    img.src = url;
  };

  useEffect(() => {
    localStorage.setItem('tennis_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('tennis_scheduleGenerated', JSON.stringify(scheduleGenerated));
  }, [scheduleGenerated]);

  useEffect(() => {
    localStorage.setItem('tennis_completedMatches', JSON.stringify(completedMatches));
  }, [completedMatches]);

  useEffect(() => {
    localStorage.setItem('tennis_liveMatchId', JSON.stringify(liveMatchId));
  }, [liveMatchId]);

  useEffect(() => {
    localStorage.setItem('tennis_livePoints', JSON.stringify(livePoints));
  }, [livePoints]);

  useEffect(() => {
    localStorage.setItem('tennis_isTiebreak', JSON.stringify(isTiebreak));
  }, [isTiebreak]);

  useEffect(() => {
    localStorage.setItem('tennis_tiebreakPoints', JSON.stringify(tiebreakPoints));
  }, [tiebreakPoints]);

  // === 친구들과 실시간으로 공유하는 상태 동기화 (InsForge: tennis_shared_state 단일 행) ===
  const SHARED_STATE_ID = 1;
  const isHydratedRef = useRef(false);
  const lastSyncedRef = useRef('');
  const pushTimerRef = useRef(null);

  const buildSharedPayload = () => ({
    attendees,
    core_members: coreMembers,
    schedule,
    schedule_generated: scheduleGenerated,
    live_match_id: liveMatchId,
    live_points: livePoints,
    is_tiebreak: isTiebreak,
    tiebreak_points: tiebreakPoints,
  });

  const normalizeSharedRow = (row) => ({
    attendees: row.attendees || [],
    core_members: (row.core_members && row.core_members.length) ? row.core_members : DEFAULT_MEMBERS,
    schedule: row.schedule || [],
    schedule_generated: !!row.schedule_generated,
    live_match_id: row.live_match_id ?? null,
    live_points: row.live_points || { A: 0, B: 0 },
    is_tiebreak: !!row.is_tiebreak,
    tiebreak_points: row.tiebreak_points || { A: 0, B: 0 },
  });

  const applyRemoteState = (normalized) => {
    setAttendees(normalized.attendees);
    setCoreMembers(normalized.core_members);
    setSchedule(normalized.schedule);
    setScheduleGenerated(normalized.schedule_generated);
    setLiveMatchId(normalized.live_match_id);
    setLivePoints(normalized.live_points);
    setIsTiebreak(normalized.is_tiebreak);
    setTiebreakPoints(normalized.tiebreak_points);
    setCompletedMatches(normalized.schedule.filter(m => m.isCompleted));
  };

  // 최초 로드: 서버 공유 상태를 가져와 반영하거나, 서버가 비어있으면 내 로컬 데이터를 시드로 업로드
  useEffect(() => {
    (async () => {
      const { data, error } = await insforge.database
        .from('tennis_shared_state')
        .select()
        .eq('id', SHARED_STATE_ID)
        .maybeSingle();

      if (error || !data) {
        isHydratedRef.current = true;
        return;
      }

      const serverIsEmpty = (!data.schedule || data.schedule.length === 0) && (!data.attendees || data.attendees.length === 0);
      const hasLocalData = schedule.length > 0 || attendees.length > 0;

      if (serverIsEmpty && hasLocalData) {
        const payload = buildSharedPayload();
        lastSyncedRef.current = JSON.stringify(payload);
        await insforge.database.from('tennis_shared_state').update(payload).eq('id', SHARED_STATE_ID);
      } else {
        const normalized = normalizeSharedRow(data);
        lastSyncedRef.current = JSON.stringify(normalized);
        applyRemoteState(normalized);
      }
      isHydratedRef.current = true;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 변경 사항을 디바운스 후 서버에 업로드 (내가 기록 중/완료한 내용을 친구들에게 전파)
  useEffect(() => {
    if (!isHydratedRef.current) return;
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(async () => {
      const payload = buildSharedPayload();
      const snapshot = JSON.stringify(payload);
      if (snapshot === lastSyncedRef.current) return;
      lastSyncedRef.current = snapshot;
      await insforge.database.from('tennis_shared_state').update(payload).eq('id', SHARED_STATE_ID);
    }, 800);
    return () => clearTimeout(pushTimerRef.current);
  }, [attendees, coreMembers, schedule, scheduleGenerated, liveMatchId, livePoints, isTiebreak, tiebreakPoints]);

  // 친구들의 변경사항을 주기적으로 확인해 반영 (5초 폴링)
  useEffect(() => {
    const timer = setInterval(async () => {
      if (!isHydratedRef.current) return;
      const { data, error } = await insforge.database
        .from('tennis_shared_state')
        .select()
        .eq('id', SHARED_STATE_ID)
        .maybeSingle();
      if (error || !data) return;

      const normalized = normalizeSharedRow(data);
      const snapshot = JSON.stringify(normalized);
      if (snapshot === lastSyncedRef.current) return;

      lastSyncedRef.current = snapshot;
      applyRemoteState(normalized);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 경기 기록 목록 로드
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_INSFORGE_URL}/api/database/records/tennis_sessions?order=session_date.desc`, {
          headers: { Authorization: `Bearer ${import.meta.env.VITE_INSFORGE_ANON_KEY}` },
        });
        if (res.ok) setSessions(await res.json());
      } catch { /* 오프라인 시 무시 */ }
    })();
  }, []);

  // 타이브레이크 시작
  const startTiebreak = () => {
    setIsTiebreak(true);
    setTiebreakPoints({ A: 0, B: 0 });
    setLivePoints({ A: 0, B: 0 });
  };

  // 타이브레이크 점수 올리기 (일반 숫자 1씩)
  const incrementTiebreak = (team) => {
    setTiebreakPoints(prev => ({
      ...prev,
      [team]: prev[team] + 1
    }));
  };

  // 타이브레이크 점수 내리기
  const decrementTiebreak = (team) => {
    setTiebreakPoints(prev => ({
      ...prev,
      [team]: Math.max(0, prev[team] - 1)
    }));
  };

  // 타이브레이크 취소
  const cancelTiebreak = () => {
    setIsTiebreak(false);
    setTiebreakPoints({ A: 0, B: 0 });
  };

  useEffect(() => {
    const newStats = {};
    const initPlayer = (name) => {
      if (!newStats[name]) newStats[name] = { name, games: 0, wins: 0, losses: 0, draws: 0, points: 0 };
    };

    completedMatches.forEach(match => {
      const { teamA, teamB, scoreA, scoreB } = match;
      const aWon = match.hasTiebreak ? match.tiebreakA > match.tiebreakB : scoreA > scoreB;
      const bWon = match.hasTiebreak ? match.tiebreakB > match.tiebreakA : scoreB > scoreA;
      const isDraw = !aWon && !bWon;
      const pointsA = match.hasTiebreak ? (aWon ? scoreA + 1 : scoreA) : scoreA;
      const pointsB = match.hasTiebreak ? (bWon ? scoreB + 1 : scoreB) : scoreB;

      teamA.forEach(p => {
        initPlayer(p);
        newStats[p].games++;
        newStats[p].points += pointsA;
        if (aWon) newStats[p].wins++;
        else if (bWon) newStats[p].losses++;
        else if (isDraw) newStats[p].draws++;
      });

      teamB.forEach(p => {
        initPlayer(p);
        newStats[p].games++;
        newStats[p].points += pointsB;
        if (bWon) newStats[p].wins++;
        else if (aWon) newStats[p].losses++;
        else if (isDraw) newStats[p].draws++;
      });
    });
    setPlayerStats(newStats);
  }, [completedMatches]);

  // Chart data preparation
  const chartData = useMemo(() => {
    return Object.values(playerStats)
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);
  }, [playerStats]);

  const winDistribution = useMemo(() => {
    const wins = Object.values(playerStats).reduce((acc, p) => acc + p.wins, 0);
    const losses = Object.values(playerStats).reduce((acc, p) => acc + p.losses, 0);
    const draws = Object.values(playerStats).reduce((acc, p) => acc + (p.draws||0), 0);
    return [
      { name: '승리', value: wins },
      { name: '무승부', value: draws },
      { name: '패배', value: losses }
    ];
  }, [playerStats]);

  // 파트너 궁합 분석
  const partnerStats = useMemo(() => {
    const pairs = {};
    completedMatches.forEach(match => {
      const { teamA, teamB, scoreA, scoreB } = match;
      const aWon = match.hasTiebreak ? match.tiebreakA > match.tiebreakB : scoreA > scoreB;
      const draw = !aWon && !(match.hasTiebreak ? match.tiebreakB > match.tiebreakA : scoreB > scoreA);
      const pointsA = match.hasTiebreak ? (aWon ? scoreA + 1 : scoreA) : scoreA;
      const pointsB = match.hasTiebreak ? (!aWon && !draw ? scoreB + 1 : scoreB) : scoreB;
      const addPair = (p1, p2, won, drew) => {
        const key = [p1,p2].sort().join('|');
        if (!pairs[key]) pairs[key] = { players:[p1,p2], games:0, wins:0, draws:0, points:0 };
        pairs[key].games++;
        const isTeamA = p1===teamA[0]||p1===teamA[1];
        pairs[key].points += isTeamA ? pointsA : pointsB;
        if (won) pairs[key].wins++;
        if (drew) pairs[key].draws++;
      };
      if(teamA.length===2) addPair(teamA[0],teamA[1], aWon, draw);
      if(teamB.length===2) addPair(teamB[0],teamB[1], !aWon&&!draw, draw);
    });
    return Object.values(pairs).sort((a,b)=>b.wins-a.wins||b.games-a.games).slice(0,5);
  }, [completedMatches]);

  const enhancedPlayerStats = useMemo(() => {
    const stats = {};

    const initPlayer = (name) => {
      if (!stats[name]) {
        stats[name] = {
          name,
          games: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          pointsFor: 0,
          pointsAgainst: 0,
        };
      }
    };

    completedMatches.forEach(match => {
      const { teamA = [], teamB = [], scoreA = 0, scoreB = 0 } = match;
      const aWon = match.hasTiebreak ? match.tiebreakA > match.tiebreakB : scoreA > scoreB;
      const bWon = match.hasTiebreak ? match.tiebreakB > match.tiebreakA : scoreB > scoreA;
      const isDraw = !aWon && !bWon;
      const pointsA = match.hasTiebreak ? (aWon ? scoreA + 1 : scoreA) : scoreA;
      const pointsB = match.hasTiebreak ? (bWon ? scoreB + 1 : scoreB) : scoreB;

      teamA.forEach(name => {
        initPlayer(name);
        stats[name].games++;
        stats[name].pointsFor += pointsA;
        stats[name].pointsAgainst += pointsB;
        if (aWon) stats[name].wins++;
        else if (bWon) stats[name].losses++;
        else if (isDraw) stats[name].draws++;
      });

      teamB.forEach(name => {
        initPlayer(name);
        stats[name].games++;
        stats[name].pointsFor += pointsB;
        stats[name].pointsAgainst += pointsA;
        if (bWon) stats[name].wins++;
        else if (aWon) stats[name].losses++;
        else if (isDraw) stats[name].draws++;
      });
    });

    return Object.values(stats).map(player => {
      const pointDiff = player.pointsFor - player.pointsAgainst;
      const leaguePoints = player.wins * 3 + player.draws;
      const winRate = player.games > 0 ? Math.round((player.wins / player.games) * 100) : 0;
      const impactScore = leaguePoints * 10 + pointDiff + player.games * 2;

      return {
        ...player,
        pointDiff,
        leaguePoints,
        winRate,
        impactScore,
      };
    });
  }, [completedMatches]);

  const pointDiffData = useMemo(() => {
    return [...enhancedPlayerStats].sort((a, b) => b.pointDiff - a.pointDiff);
  }, [enhancedPlayerStats]);

  const impactRanking = useMemo(() => {
    return [...enhancedPlayerStats].sort((a, b) => b.impactScore - a.impactScore);
  }, [enhancedPlayerStats]);

  const participationBalance = useMemo(() => {
    const averageGames = attendees.length > 0 ? (completedMatches.length * 4) / attendees.length : 0;
    return attendees
      .map(name => {
        const stat = enhancedPlayerStats.find(player => player.name === name);
        const games = stat?.games || 0;
        return {
          name,
          games,
          gap: Number((games - averageGames).toFixed(1)),
        };
      })
      .sort((a, b) => b.games - a.games || a.name.localeCompare(b.name));
  }, [attendees, completedMatches.length, enhancedPlayerStats]);

  const closeMatches = useMemo(() => {
    return completedMatches
      .map(match => {
        const margin = Math.abs((match.scoreA || 0) - (match.scoreB || 0));
        return {
          ...match,
          margin,
          isClose: margin <= 1 || !!match.hasTiebreak || match.scoreA === match.scoreB,
        };
      })
      .filter(match => match.isClose)
      .sort((a, b) => a.margin - b.margin || Number(b.hasTiebreak) - Number(a.hasTiebreak));
  }, [completedMatches]);

  const partnerMatrix = useMemo(() => {
    const matrix = {};

    completedMatches.forEach(match => {
      const addPair = (team, scoreFor, scoreAgainst) => {
        if (!Array.isArray(team) || team.length !== 2) return;
        const [p1, p2] = team;
        const key = [p1, p2].sort().join('|');

        if (!matrix[key]) {
          matrix[key] = {
            players: [p1, p2],
            games: 0,
            wins: 0,
            draws: 0,
            pointDiff: 0,
          };
        }

        matrix[key].games++;
        matrix[key].pointDiff += scoreFor - scoreAgainst;
        if (scoreFor > scoreAgainst) matrix[key].wins++;
        if (scoreFor === scoreAgainst) matrix[key].draws++;
      };

      addPair(match.teamA, match.scoreA || 0, match.scoreB || 0);
      addPair(match.teamB, match.scoreB || 0, match.scoreA || 0);
    });

    return Object.values(matrix)
      .map(pair => ({
        ...pair,
        winRate: pair.games > 0 ? Math.round((pair.wins / pair.games) * 100) : 0,
      }))
      .sort((a, b) => b.winRate - a.winRate || b.pointDiff - a.pointDiff || b.games - a.games);
  }, [completedMatches]);

  const matchupStats = useMemo(() => {
    const rows = {};

    completedMatches.forEach(match => {
      const teamAKey = [...(match.teamA || [])].sort().join(' & ');
      const teamBKey = [...(match.teamB || [])].sort().join(' & ');
      const key = `${teamAKey} vs ${teamBKey}`;

      if (!rows[key]) {
        rows[key] = {
          matchup: key,
          games: 0,
          teamAWins: 0,
          teamBWins: 0,
          draws: 0,
          pointDiff: 0,
        };
      }

      rows[key].games++;
      rows[key].pointDiff += (match.scoreA || 0) - (match.scoreB || 0);
      if (match.scoreA > match.scoreB) rows[key].teamAWins++;
      else if (match.scoreB > match.scoreA) rows[key].teamBWins++;
      else rows[key].draws++;
    });

    return Object.values(rows)
      .sort((a, b) => b.games - a.games || Math.abs(b.pointDiff) - Math.abs(a.pointDiff));
  }, [completedMatches]);

  // TMI 코멘트: 전 선수를 한꺼번에 계산해 세션 내 중복을 방지하고 분기별 오프셋 적용
  const tmiComments = useMemo(() => {
    const result = {};
    const used = new Set();
    const q = Math.floor(new Date().getMonth() / 3);
    const getTierPool = (player) => {
      const { wins = 0, losses = 0, draws = 0 } = player;
      let tier;
      if (wins === 0 && losses === 0) tier = 'none';
      else {
        const wr = wins / (wins + losses + draws) * 100;
        if (wr >= 80) tier = 'high';
        else if (wr >= 60) tier = 'midHigh';
        else if (wr >= 50) tier = 'even';
        else if (wr >= 30) tier = 'midLow';
        else tier = 'low';
      }
      const all = ALL_FUN_COMMENTS[tier];
      const shift = Math.floor(all.length * q / 4);
      return [...all.slice(shift), ...all.slice(0, shift)];
    };
    Object.values(playerStats)
      .sort((a, b) => b.wins - a.wins)
      .forEach(player => {
        const pool = getTierPool(player);
        const available = pool.filter(c => !used.has(c));
        const source = available.length > 0 ? available : pool;
        let hash = 0;
        for (let i = 0; i < player.name.length; i++) hash = (hash * 31 + player.name.charCodeAt(i)) >>> 0;
        const comment = source[hash % source.length];
        used.add(comment);
        result[player.name] = comment;
      });
    return result;
  }, [playerStats]);

  // 경기 기록 저장
  const saveSession = async () => {
    if (completedMatches.length === 0) { alert('저장할 경기 결과가 없습니다.'); return; }
    try {
      const payload = { session_date: matchDate, attendees, matches: completedMatches, stats: playerStats };
      const res = await fetch(`${import.meta.env.VITE_INSFORGE_URL}/api/database/records/tennis_sessions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${import.meta.env.VITE_INSFORGE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert('경기 기록이 저장되었습니다!');
        const listRes = await fetch(`${import.meta.env.VITE_INSFORGE_URL}/api/database/records/tennis_sessions?order=session_date.desc`, {
          headers: { Authorization: `Bearer ${import.meta.env.VITE_INSFORGE_ANON_KEY}` },
        });
        if (listRes.ok) setSessions(await listRes.json());
      } else { alert('저장에 실패했습니다.'); }
    } catch { alert('저장에 실패했습니다.'); }
  };

  // HTML 대시보드 내보내기
  const exportDashboard = () => {
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const today = new Date().toLocaleDateString('ko-KR', {year:'numeric',month:'long',day:'numeric'});
    const topP = Object.values(playerStats).sort((a,b)=>b.wins-a.wins||b.points-a.points)[0];
    const matchPlayers = [...new Set(completedMatches.flatMap(m => [...(m.teamA||[]), ...(m.teamB||[])]))];
    const rows = matchPlayers.map(a => {
      const st = playerStats[a]||{games:0,wins:0,losses:0,draws:0,points:0};
      const wr = st.games>0 ? Math.round(st.wins/st.games*100) : 0;
      return `<tr><td><b>${a}</b></td><td>${st.games}</td><td style="color:#10B981">${st.wins}승</td><td style="color:#EF4444">${st.losses}패</td><td style="color:#F59E0B">${st.draws||0}무</td><td>${st.points}pts</td><td>${wr}%</td></tr>`;
    }).join('');
    const matchRows = completedMatches.map(m => {
      const res = m.scoreA>m.scoreB?'A팀 승':'';
      const res2 = m.scoreB>m.scoreA?'B팀 승':res;
      const result = m.scoreA===m.scoreB?'무승부':res2;
      return `<tr><td>${m.id}경기</td><td>${m.teamA.join(', ')}</td><td style="font-size:20px;font-weight:900">${m.scoreA} : ${m.scoreB}</td><td>${m.teamB.join(', ')}</td><td>${result}</td></tr>`;
    }).join('');
    const pairRows = partnerStats.map(p => `<tr><td><b>${p.players.join(' & ')}</b></td><td>${p.games}</td><td>${p.wins}승</td><td>${p.draws}무</td></tr>`).join('');
    const html = `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>🎾 테니스 경기 결과 - ${today}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:'Noto Sans KR',sans-serif;}
body{background:#0f172a;color:#e2e8f0;padding:20px;}
.container{max-width:700px;margin:0 auto;}
h1{text-align:center;font-size:28px;font-weight:900;background:linear-gradient(135deg,#4F46E5,#10B981);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px;}
.date{text-align:center;color:#94a3b8;margin-bottom:24px;}
.card{background:#1e293b;border-radius:16px;padding:20px;margin-bottom:16px;border:1px solid #334155;}
.card h2{font-size:16px;font-weight:700;margin-bottom:12px;color:#a78bfa;}
.mvp{background:linear-gradient(135deg,#4F46E5,#7C3AED);border-radius:16px;padding:24px;margin-bottom:16px;text-align:center;}
.mvp .name{font-size:32px;font-weight:900;margin:8px 0;}
.mvp .stat{color:rgba(255,255,255,0.8);}
table{width:100%;border-collapse:collapse;}
th{text-align:left;color:#64748b;font-size:12px;padding:8px 4px;border-bottom:1px solid #334155;}
td{padding:10px 4px;border-bottom:1px solid #1e293b;font-size:14px;}
.badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:12px;font-weight:700;}
.win{background:#064e3b;color:#10B981;}
.lose{background:#450a0a;color:#EF4444;}
.draw{background:#451a03;color:#F59E0B;}
footer{text-align:center;color:#475569;margin-top:24px;font-size:12px;}
</style></head><body>
<div class="container">
<h1>🎾 테니스 경기 결과</h1>
<p class="date">${today} · 총 ${completedMatches.length}게임</p>
${topP ? `<div class="mvp"><div>🏆 오늘의 테니스 킹!</div><div class="name">${topP.name}</div><div class="stat">${topP.wins}승 ${topP.losses}패 ${topP.draws||0}무 / ${topP.points}pts</div></div>` : ''}
<div class="card"><h2>📊 경기 결과</h2>
<table><thead><tr><th>경기</th><th>A팀</th><th>스코어</th><th>B팀</th><th>결과</th></tr></thead>
<tbody>${matchRows}</tbody></table></div>
<div class="card"><h2>👤 개인 기록</h2>
<table><thead><tr><th>이름</th><th>참여</th><th>승</th><th>패</th><th>무</th><th>점수</th><th>승률</th></tr></thead>
<tbody>${rows}</tbody></table></div>
${pairRows ? `<div class="card"><h2>🤝 베스트 파트너</h2><table><thead><tr><th>조합</th><th>게임</th><th>승</th><th>무</th></tr></thead><tbody>${pairRows}</tbody></table></div>` : ''}
<footer>Tennis Matcher Pro · ${today}</footer>
</div></body></html>`;
    const blob = new Blob([html], {type:'text/html;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `tennis_${dateStr}.html`;
    a.click(); URL.revokeObjectURL(url);
  };

  const toggleAttendance = (name) => {
    setAttendees(prev => 
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const addGuest = (e) => {
    e.preventDefault();
    if (guestName.trim() && !attendees.includes(`${guestName.trim()}(게스트)`)) {
      setAttendees([...attendees, `${guestName.trim()}(게스트)`]);
      setGuestName('');
    }
  };

  const generateFullSchedule = (targetGames) => {
    const N = attendees.length;
    if (N < 4) {
      alert("매칭을 위해 최소 4명이 필요합니다.");
      return;
    }
    
    const GAMES_COUNT = typeof targetGames === 'number' ? targetGames : N;
    const targetPlays = (GAMES_COUNT * 4) / N;
    const newSchedule = [];
    
    const playCount = {};
    const consecutivePlays = {};
    const consecutiveRests = {};
    const partnerHistory = {}; 
    const opponentHistory = {};
    
    attendees.forEach(p => {
      playCount[p] = 0;
      consecutivePlays[p] = 0;
      consecutiveRests[p] = 0;
      partnerHistory[p] = {};
      opponentHistory[p] = {};
    });

    const getCombinations = (arr, k) => {
      const result = [];
      const combine = (start, combo) => {
        if (combo.length === k) {
          result.push([...combo]);
          return;
        }
        for (let i = start; i < arr.length; i++) {
          combo.push(arr[i]);
          combine(i + 1, combo);
          combo.pop();
        }
      };
      combine(0, []);
      return result;
    };

    const allQuartets = getCombinations(attendees, 4);
    
    for (let gameIdx = 0; gameIdx < GAMES_COUNT; gameIdx++) {
      let bestMatch = null;
      let minPenalty = Infinity;
      
      const shuffledQuartets = [...allQuartets].sort(() => Math.random() - 0.5);

      for (const quartet of shuffledQuartets) {
        if (quartet.some(p => playCount[p] >= targetPlays)) continue;

        const splits = [
          [[quartet[0], quartet[1]], [quartet[2], quartet[3]]],
          [[quartet[0], quartet[2]], [quartet[1], quartet[3]]],
          [[quartet[0], quartet[3]], [quartet[1], quartet[2]]]
        ];

        for (const [teamA, teamB] of splits) {
          let penalty = 0;
          
          for (const p of attendees) {
            const isPlaying = quartet.includes(p);
            if (isPlaying) {
              if (consecutivePlays[p] >= 2) penalty += 50 * consecutivePlays[p];
              penalty += playCount[p] * 10;
            } else {
              if (consecutiveRests[p] >= 1) penalty += 30 * consecutiveRests[p];
            }
          }
          
          penalty += (partnerHistory[teamA[0]][teamA[1]] || 0) * 100;
          penalty += (partnerHistory[teamB[0]][teamB[1]] || 0) * 100;
          
          for (const a of teamA) {
            for (const b of teamB) {
              penalty += (opponentHistory[a][b] || 0) * 20;
            }
          }
          
          if (penalty < minPenalty) {
            minPenalty = penalty;
            bestMatch = { teamA, teamB, quartet };
          }
        }
      }
      
      if (!bestMatch) {
        const sorted = [...attendees].filter(p => playCount[p] < targetPlays).sort((a, b) => playCount[a] - playCount[b] || Math.random() - 0.5);
        const fallbackQuartet = sorted.slice(0, 4);
        bestMatch = {
          teamA: [fallbackQuartet[0], fallbackQuartet[1]],
          teamB: [fallbackQuartet[2], fallbackQuartet[3]],
          quartet: fallbackQuartet
        };
      }

      const { teamA, teamB, quartet } = bestMatch;
      
      attendees.forEach(p => {
        if (quartet.includes(p)) {
          playCount[p]++;
          consecutivePlays[p]++;
          consecutiveRests[p] = 0;
        } else {
          consecutiveRests[p]++;
          consecutivePlays[p] = 0;
        }
      });
      
      partnerHistory[teamA[0]][teamA[1]] = (partnerHistory[teamA[0]][teamA[1]] || 0) + 1;
      partnerHistory[teamA[1]][teamA[0]] = (partnerHistory[teamA[1]][teamA[0]] || 0) + 1;
      partnerHistory[teamB[0]][teamB[1]] = (partnerHistory[teamB[0]][teamB[1]] || 0) + 1;
      partnerHistory[teamB[1]][teamB[0]] = (partnerHistory[teamB[1]][teamB[0]] || 0) + 1;
      
      for (const a of teamA) {
        for (const b of teamB) {
          opponentHistory[a][b] = (opponentHistory[a][b] || 0) + 1;
          opponentHistory[b][a] = (opponentHistory[b][a] || 0) + 1;
        }
      }

      newSchedule.push({
        id: gameIdx + 1,
        teamA: [...teamA],
        teamB: [...teamB],
        scoreA: 0,
        scoreB: 0,
        isCompleted: false,
        timestamp: null
      });
    }
    
    setSchedule(newSchedule);
    setScheduleGenerated(true);
    setActiveTab('schedule');
  };

  const startEditMatch = (match) => {
    setEditingMatchId(match.id);
    setEditMatchData({
      teamA: [...match.teamA],
      teamB: [...match.teamB]
    });
  };

  const cancelEditMatch = () => {
    setEditingMatchId(null);
    setEditMatchData(null);
  };

  const saveEditMatch = (matchId) => {
    setSchedule(prev => prev.map(m => 
      m.id === matchId ? { ...m, teamA: editMatchData.teamA, teamB: editMatchData.teamB } : m
    ));
    setEditingMatchId(null);
    setEditMatchData(null);
  };

  const updateEditingPlayer = (team, index, newValue) => {
    setEditMatchData(prev => {
      const newData = { ...prev };
      newData[team][index] = newValue;
      return newData;
    });
  };

  const addGame = () => {
    setSchedule(prev => {
      const maxId = prev.length > 0 ? Math.max(...prev.map(m => m.id)) : 0;
      const newMatch = {
        id: maxId + 1,
        teamA: [attendees[0] || '', attendees[1] || ''],
        teamB: [attendees[2] || '', attendees[3] || ''],
        scoreA: 0,
        scoreB: 0,
        isCompleted: false,
        timestamp: null
      };
      return [...prev, newMatch];
    });
  };

  const deleteGame = (matchId) => {
    if (window.confirm(`${matchId}번 경기를 삭제하시겠습니까?`)) {
      setSchedule(prev => prev.filter(m => m.id !== matchId));
      setCompletedMatches(prev => prev.filter(m => m.id !== matchId));
      if (editingMatchId === matchId) cancelEditMatch();
    }
  };

  // 저장된 경기 결과를 다시 진행 상태로 되돌려 점수/멤버를 재입력할 수 있게 함
  const reopenMatch = (matchId) => {
    if (!window.confirm(`${matchId}번 경기 결과를 수정하시겠습니까?\n저장된 결과가 초기화되고, 점수와 멤버를 다시 입력한 뒤 [결과 로컬 저장]을 눌러야 반영됩니다.`)) return;
    setSchedule(prev => prev.map(m => m.id === matchId
      ? { ...m, isCompleted: false, hasTiebreak: false, tiebreakA: null, tiebreakB: null, timestamp: null }
      : m));
    setCompletedMatches(prev => prev.filter(m => m.id !== matchId));
  };

  const incrementPoint = (team) => {
    setLivePoints(prev => {
      const isA = team === 'A';
      const myP = isA ? prev.A : prev.B;
      const opP = isA ? prev.B : prev.A;
      
      let newMyP = myP;
      let newOpP = opP;
      
      if (myP === 3 && opP < 3) {
        updateScore(liveMatchId, team, 1);
        return { A: 0, B: 0 };
      } else if (myP === 3 && opP === 3) {
        newMyP = 4;
      } else if (myP === 3 && opP === 4) {
        newOpP = 3;
      } else if (myP === 4) {
        updateScore(liveMatchId, team, 1);
        return { A: 0, B: 0 };
      } else {
        newMyP = myP + 1;
      }
      
      return isA ? { A: newMyP, B: newOpP } : { A: newOpP, B: newMyP };
    });
  };

  const decrementPoint = (team) => {
    setLivePoints(prev => {
      const isA = team === 'A';
      const myP = isA ? prev.A : prev.B;
      const opP = isA ? prev.B : prev.A;
      
      let newMyP = myP;
      if (myP > 0) {
        if (myP === 4) {
          newMyP = 3;
        } else {
          newMyP = myP - 1;
        }
      }
      return isA ? { A: newMyP, B: opP } : { A: opP, B: newMyP };
    });
  };

  const updateScore = (matchId, team, increment) => {
    setSchedule(prev => prev.map(m => {
      if (m.id === matchId && !m.isCompleted) {
        if (team === 'A') {
          return { ...m, scoreA: Math.max(0, m.scoreA + increment) };
        } else {
          return { ...m, scoreB: Math.max(0, m.scoreB + increment) };
        }
      }
      return m;
    }));
  };

  const saveMatchResult = async (match) => {
    const tbInfo = isTiebreak ? ` (타이브레이크 ${tiebreakPoints.A}:${tiebreakPoints.B})` : '';
    const isConfirmed = window.confirm(`${match.id}번 경기 결과를 저장하시겠습니까?\n게임: ${match.scoreA}:${match.scoreB}${tbInfo}\n(로컬에 저장되며, 전체 경기가 끝나면 대시보드 탭에서 구글 시트로 일괄 저장해 주세요)`);
    if (!isConfirmed) return;

    const completedMatch = {
      ...match,
      isCompleted: true,
      timestamp: new Date(),
      hasTiebreak: isTiebreak,
      tiebreakA: isTiebreak ? tiebreakPoints.A : null,
      tiebreakB: isTiebreak ? tiebreakPoints.B : null,
    };
    
    // 로컬 상태 먼저 업데이트 (빠른 UI 반응)
    setSchedule(prev => prev.map(m => m.id === match.id ? completedMatch : m));
    setCompletedMatches(prev => {
      if (prev.find(m => m.id === match.id)) return prev.map(m => m.id === match.id ? completedMatch : m);
      return [...prev, completedMatch];
    });

    if (liveMatchId === match.id) {
      setIsTiebreak(false);
      setTiebreakPoints({ A: 0, B: 0 });
      setLiveMatchId(null);
      setActiveTab('schedule');
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);
  
  const syncToGoogleSheets = async () => {
    if (completedMatches.length === 0) {
      alert('저장할 완료된 경기가 없습니다.');
      return;
    }
    
    const isConfirmed = window.confirm(`총 ${completedMatches.length}개의 경기 결과를 구글 시트에 일괄 저장하시겠습니까?`);
    if (!isConfirmed) return;
    
    setIsSyncing(true);
    try {
      const promises = completedMatches.map(completedMatch => {
        const payload = {
          date: `${matchDate} ${format(new Date(completedMatch.timestamp), 'HH:mm')}`,
          matchId: completedMatch.id,
          teamA: completedMatch.teamA.join(', '),
          teamB: completedMatch.scoreA,            // A팀 점수를 teamB 키로 전송 (Apps Script 오류 우회)
          scoreA: completedMatch.scoreB,           // B팀 점수를 scoreA 키로 전송
          scoreB: completedMatch.teamB.join(', '), // B팀 명단을 scoreB 키로 전송
          hasTiebreak: completedMatch.hasTiebreak ? 'Y' : 'N',
          tiebreakA: completedMatch.hasTiebreak ? completedMatch.tiebreakA : '',
          tiebreakB: completedMatch.hasTiebreak ? completedMatch.tiebreakB : ''
        };

        return fetch(GOOGLE_SHEET_WEBHOOK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      });
      
      await Promise.all(promises);
      alert('구글 시트에 모든 경기 결과 저장이 완료되었습니다!');
    } catch (error) {
      console.error('구글 시트 전송 오류:', error);
      alert('구글 시트 저장 중 오류가 발생했습니다.');
    }
    setIsSyncing(false);
  };

  const resetAllData = () => {
    if(window.confirm('모든 데이터를 초기화하시겠습니까?\n(현재의 출석, 스케줄, 점수 모두 삭제됩니다)')) {
      setAttendees([]);
      setSchedule([]);
      setScheduleGenerated(false);
      setCompletedMatches([]);
      setLiveMatchId(null);
      setActiveTab('attendance');
      localStorage.clear();
    }
  };

  // 공동 1위까지 모두 포함한 오늘의 MVP 목록 (승수 → 포인트 동률이면 전부 포함)
  const topPlayers = useMemo(() => {
    const players = Object.values(playerStats);
    if (players.length === 0) return [];
    const sorted = [...players].sort((a, b) => b.wins - a.wins || b.points - a.points);
    const best = sorted[0];
    if (!best || best.wins === 0) return [];
    return sorted.filter(p => p.wins === best.wins && p.points === best.points);
  }, [playerStats]);

  // 포인트 랭킹 차트의 X축에 이름+사진을 함께 그려주는 커스텀 틱
  const renderRankingTick = ({ x, y, payload, index }) => {
    const name = payload.value;
    const photo = getMemberPhoto(name);
    const clipId = `ranking-tick-clip-${index}`;
    return (
      <g transform={`translate(${x},${y})`}>
        {photo && (
          <defs>
            <clipPath id={clipId}><circle cx="0" cy="15" r="14" /></clipPath>
          </defs>
        )}
        {photo
          ? <image href={photo} x="-14" y="1" width="28" height="28" clipPath={`url(#${clipId})`} preserveAspectRatio="xMidYMid slice" />
          : <circle cx="0" cy="15" r="14" fill="#4F46E5" />}
        {!photo && <text x="0" y="20" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="800">{name.charAt(0)}</text>}
        <text x="0" y="44" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="700">{name}</text>
      </g>
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <Trophy className="icon text-primary" size={28} />
            <h1>Tennis Matcher <span className="badge">Pro</span></h1>
          </div>
          <div className="date-display" style={{ display: 'flex', alignItems: 'center' }}>
            <input 
              type="date" 
              value={matchDate} 
              onChange={(e) => setMatchDate(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontSize: '0.9rem', fontWeight: 'bold', color: '#4b5563', cursor: 'pointer', outline: 'none' }}
            />
          </div>
        </div>
      </header>

      <main className="main-content">
        <nav className="tab-nav">
          <button className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
            <Users size={18} /> 출석
          </button>
          <button className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
            <CalendarDays size={18} /> 전체 일정
          </button>
          <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <BarChart3 size={18} /> 대시보드
          </button>
          <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => { setActiveTab('history'); setSelectedSession(null); }}>
            <History size={18} /> 기록
          </button>
          {liveMatchId && (
            <button className={`tab-btn ${activeTab === 'live' ? 'active' : ''}`} onClick={() => setActiveTab('live')} style={{color: '#EF4444', fontWeight: 'bold'}}>
              <Flame size={18} /> 라이브 득점
            </button>
          )}
        </nav>

        {activeTab === 'attendance' && (
          <section className="tab-pane fade-in">
            <div className="card">
              <div className="card-header">
                <h2>멤버 출석 체크</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="count-badge">{attendees.length}명</span>
                  <button
                    onClick={() => { setIsMemberEditMode(v => !v); setEditingMemberIdx(null); setNewMemberName(''); }}
                    className={`member-edit-toggle ${isMemberEditMode ? 'active' : ''}`}
                    title={isMemberEditMode ? '편집 완료' : '멤버 편집'}
                  >
                    {isMemberEditMode ? <><X size={14} /> 완료</> : <><Edit2 size={14} /> 편집</>}
                  </button>
                </div>
              </div>

              {isMemberEditMode ? (
                <div className="member-edit-grid">
                  <div style={{ fontSize: '12px', color: '#64748B', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '8px 12px', lineHeight: 1.5 }}>
                    💡 아래에서 <b>+ 새 멤버 이름</b>으로 신규 회원을 추가하면 목록 맨 아래에 바로 나타나요. 이름 옆 <Camera size={12} style={{ verticalAlign: '-2px' }} /> 카메라 아이콘을 눌러 바로 프로필 사진을 등록/변경할 수 있습니다. 오늘만 참여하는 게스트는 아래 [게스트 추가]에서 등록해 주세요.
                  </div>
                  {coreMembers.map((member, idx) => (
                    <div key={idx} className="member-edit-item">
                      {editingMemberIdx === idx ? (
                        <div className="member-name-edit">
                          <input
                            autoFocus
                            value={editingMemberName}
                            onChange={e => setEditingMemberName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveEditMember(idx); if (e.key === 'Escape') setEditingMemberIdx(null); }}
                            className="member-name-input"
                            maxLength={8}
                          />
                          <button onClick={() => saveEditMember(idx)} className="member-action-btn save" title="저장"><Save size={13} /></button>
                          <button onClick={() => setEditingMemberIdx(null)} className="member-action-btn cancel" title="취소"><X size={13} /></button>
                        </div>
                      ) : (
                        <div className="member-name-view">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MemberAvatar photo={getMemberPhoto(member)} name={member} size={34} />
                            <span className="member-name">{member}</span>
                          </div>
                          <div className="member-action-group">
                            <label className="member-action-btn photo" title="사진 변경" style={{ cursor: 'pointer' }}>
                              <Camera size={13} />
                              <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) handlePhotoUpload(member, e.target.files[0]); e.target.value = ''; }} style={{ display: 'none' }} />
                            </label>
                            <button onClick={() => startEditMember(idx)} className="member-action-btn edit" title="이름 수정"><Edit2 size={13} /></button>
                            <button onClick={() => deleteMember(idx)} className="member-action-btn delete" title="삭제"><Trash2 size={13} /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* 새 멤버 추가 */}
                  <form onSubmit={addCoreMember} className="member-add-form">
                    <input
                      value={newMemberName}
                      onChange={e => setNewMemberName(e.target.value)}
                      placeholder="+ 새 멤버 이름"
                      className="member-name-input"
                      maxLength={8}
                    />
                    <button type="submit" className="member-action-btn save" title="추가"><Plus size={13} /></button>
                  </form>
                </div>
              ) : (
                <div className="grid-list">
                  {coreMembers.map(member => {
                    const isPresent = attendees.includes(member);
                    return (
                      <div key={member} onClick={() => toggleAttendance(member)} className={`member-card ${isPresent ? 'present' : ''}`}>
                        {isPresent && <CheckCircle2 className="check-icon" size={16} />}
                        <MemberAvatar photo={getMemberPhoto(member)} name={member} size={60} />
                        <span className="member-name" style={{ display: 'block', marginTop: '6px' }}>{member}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="card mt-4">
              <div className="card-header"><h2>게스트 추가</h2></div>
              <form onSubmit={addGuest} className="guest-form">
                <div className="input-group">
                  <UserPlus size={20} className="input-icon" />
                  <input type="text" placeholder="이름 입력..." value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                  <button type="submit" className="btn btn-secondary">추가</button>
                </div>
              </form>
            </div>

            <div className="card mt-4 attendance-list">
              <div className="card-header"><h2>선발 명단 ({attendees.length}명)</h2></div>
              <div className="chips mb-4">
                {attendees.map(a => <span key={a} className="chip" onClick={() => toggleAttendance(a)}>{a} &times;</span>)}
              </div>
              <div className="info-box mb-4">
                <p className="text-sm text-muted">※ 인원수에 맞는 <b>최소 균등 경기 수</b>를 계산하여 100% 공평한 스케줄을 편성합니다. 대관 시간에 맞춰 원하는 라운드를 선택하세요.</p>
              </div>
              {attendees.length >= 4 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(() => {
                    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
                    const baseGames = attendees.length / gcd(attendees.length, 4);
                    const options = [];
                    for (let m = 1; m <= 4; m++) {
                      const tg = baseGames * m;
                      const plays = (tg * 4) / attendees.length;
                      if (m > 1 && tg > 16) break; // 16경기 초과는 생략 (너무 긴 시간)
                      options.push(
                        <button 
                          key={m} 
                          onClick={() => generateFullSchedule(tg)} 
                          className={`btn ${m === 1 ? 'btn-primary pulse' : 'btn-secondary'} w-full`}
                          style={{ padding: '12px', fontSize: '0.95rem' }}
                        >
                          {tg}경기 편성 (1인당 {plays}경기 참여)
                        </button>
                      );
                    }
                    return options;
                  })()}
                </div>
              )}
              <div style={{ marginTop: '16px' }}>
                <button 
                  onClick={resetAllData} 
                  className="btn btn-secondary w-full" 
                  style={{ borderColor: '#EF4444', color: '#EF4444', padding: '12px', fontWeight: 'bold' }}
                >
                  앱 초기화 (모든 데이터 삭제)
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'schedule' && (
          <section className="tab-pane fade-in">
            {!scheduleGenerated ? (
               <div className="card center empty-state">
                 <History size={48} className="text-muted" />
                 <h3>시간표가 없습니다</h3>
                 <p>출석 화면에서 [시간표 생성하기]를 눌러 스케줄을 확정해주세요.</p>
                 <button onClick={() => setActiveTab('attendance')} className="btn btn-secondary mt-4">출석 화면으로 가기</button>
               </div>
            ) : (
               <div className="schedule-list">
                 <div className="schedule-header card mb-4 center">
                   <h2>오늘의 자동 편성 시간표 (총 {schedule.length}게임)</h2>
                   <p className="text-sm text-muted">경기별 점수를 입력하고 저장을 누르세요.</p>
                 </div>
                 {schedule.map((match) => {
                   const isEditing = editingMatchId === match.id;
                   const aWon = match.isCompleted && (match.hasTiebreak ? match.tiebreakA > match.tiebreakB : match.scoreA > match.scoreB);
                   const bWon = match.isCompleted && (match.hasTiebreak ? match.tiebreakB > match.tiebreakA : match.scoreB > match.scoreA);
                   const winnerScoreStyle = { fontSize: '2.1rem', color: '#10B981', display: 'inline-flex', alignItems: 'center', gap: '4px' };
                   const iconBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
                   const selectStyle = { padding: '4px', borderRadius: '4px', border: '1px solid #E2E8F0', fontSize: '14px', width: '100px', textAlign: 'center' };
                   
                   return (
                   <div key={match.id} className={`card schedule-card ${match.isCompleted ? 'completed' : ''}`} style={{ position: 'relative' }}>
                     <div className="match-number-badge">{match.id}경기</div>
                     
                     {/* Edit / Delete Buttons */}
                     {!match.isCompleted && !isEditing && (
                       <div className="match-actions" style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                         <button style={iconBtnStyle} onClick={() => startEditMatch(match)} title="수정"><Edit2 size={16} className="text-muted" /></button>
                         <button style={iconBtnStyle} onClick={() => deleteGame(match.id)} title="삭제"><Trash2 size={16} style={{ color: '#EF4444' }} /></button>
                       </div>
                     )}
                     {/* 완료된 경기: 결과 수정 / 삭제 */}
                     {match.isCompleted && (
                       <div className="match-actions" style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                         <button style={iconBtnStyle} onClick={() => reopenMatch(match.id)} title="결과 수정"><Edit2 size={16} className="text-muted" /></button>
                         <button style={iconBtnStyle} onClick={() => deleteGame(match.id)} title="삭제"><Trash2 size={16} style={{ color: '#EF4444' }} /></button>
                       </div>
                     )}
                     {isEditing && (
                       <div className="match-actions" style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                         <button style={iconBtnStyle} onClick={() => saveEditMatch(match.id)} title="저장"><Save size={16} style={{ color: '#10B981' }} /></button>
                         <button style={iconBtnStyle} onClick={() => cancelEditMatch()} title="취소"><X size={16} className="text-muted" /></button>
                       </div>
                     )}

                     <div className="inline-match-board">
                        <div className="match-team team-a">
                          <div className="team-players" style={isEditing ? {flexDirection: 'column', gap: '4px'} : {}}>
                            {isEditing ? (
                              <>
                                <select style={selectStyle} value={editMatchData.teamA[0]} onChange={(e) => updateEditingPlayer('teamA', 0, e.target.value)}>
                                  <option value="">선택</option>
                                  {attendees.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                                <select style={selectStyle} value={editMatchData.teamA[1]} onChange={(e) => updateEditingPlayer('teamA', 1, e.target.value)}>
                                  <option value="">선택</option>
                                  {attendees.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                              </>
                            ) : match.teamA.map(name => (
                              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '6px', ...(aWon ? { fontWeight: '900', color: '#10B981' } : {}) }}>
                                <MemberAvatar photo={getMemberPhoto(name)} name={name} size={26} />
                                <span>{aWon && '🏆 '}{name}</span>
                              </div>
                            ))}
                          </div>
                          <div className="score-control-inline">
                            {!match.isCompleted && <button onClick={() => updateScore(match.id, 'A', -1)}>-</button>}
                            <span className="score" style={aWon ? winnerScoreStyle : {}}>
                              {aWon && <Crown size={20} style={{ color: '#FBBF24', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />}
                              {match.scoreA}
                            </span>
                            {!match.isCompleted && <button onClick={() => updateScore(match.id, 'A', 1)}>+</button>}
                          </div>
                        </div>
                        <div className="match-vs text-muted">VS</div>
                        <div className="match-team team-b">
                          <div className="score-control-inline">
                            {!match.isCompleted && <button onClick={() => updateScore(match.id, 'B', -1)}>-</button>}
                            <span className="score" style={bWon ? winnerScoreStyle : {}}>
                              {bWon && <Crown size={20} style={{ color: '#FBBF24', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />}
                              {match.scoreB}
                            </span>
                            {!match.isCompleted && <button onClick={() => updateScore(match.id, 'B', 1)}>+</button>}
                          </div>
                          <div className="team-players" style={isEditing ? {flexDirection: 'column', gap: '4px'} : {}}>
                            {isEditing ? (
                              <>
                                <select style={selectStyle} value={editMatchData.teamB[0]} onChange={(e) => updateEditingPlayer('teamB', 0, e.target.value)}>
                                  <option value="">선택</option>
                                  {attendees.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                                <select style={selectStyle} value={editMatchData.teamB[1]} onChange={(e) => updateEditingPlayer('teamB', 1, e.target.value)}>
                                  <option value="">선택</option>
                                  {attendees.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                              </>
                            ) : match.teamB.map(name => (
                              <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', ...(bWon ? { fontWeight: '900', color: '#10B981' } : {}) }}>
                                <span>{name}{bWon && ' 🏆'}</span>
                                <MemberAvatar photo={getMemberPhoto(name)} name={name} size={26} />
                              </div>
                            ))}
                          </div>
                        </div>
                     </div>
                     {!match.isCompleted ? (
                       <div className="match-footer mt-4" style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <button onClick={() => { 
                           if (liveMatchId !== match.id) { setLivePoints({ A: 0, B: 0 }); setTiebreakPoints({ A: 0, B: 0 }); setIsTiebreak(false); }
                           setLiveMatchId(match.id); 
                           setActiveTab('live'); 
                         }} className="btn btn-secondary sm">
                           <Flame size={14} style={{marginRight: '4px', color: '#EF4444'}}/> 라이브 점수판
                         </button>
                         <button onClick={() => saveMatchResult(match)} disabled={isEditing} className="btn btn-primary sm">
                           결과 로컬 저장
                         </button>
                       </div>
                     ) : (
                        match.scoreA === match.scoreB && !match.hasTiebreak
  ? <div className="match-footer mt-4 center" style={{color:'#F59E0B'}}><CheckCircle2 size={16} /> 무승부! {match.scoreA} : {match.scoreB} - 오늘은 동률! 🤝</div>
  : <div className="match-footer mt-4 center text-success" style={{fontWeight:'800',fontSize:'1.05rem'}}>
      <Trophy size={17} style={{marginRight:'4px'}} />
      {match.hasTiebreak
        ? (match.tiebreakA > match.tiebreakB ? match.teamA.join('+') : match.teamB.join('+'))
        : (match.scoreA > match.scoreB ? match.teamA.join('+') : match.teamB.join('+'))
      } 승리! ({match.scoreA}:{match.scoreB}{match.hasTiebreak ? ` TB ${match.tiebreakA}:${match.tiebreakB}` : ''})
    </div>
                     )}
                   </div>
                 )})}
                 
                 <div className="add-match-container mt-6 center" style={{ marginTop: '24px', textAlign: 'center' }}>
                   <button className="btn btn-secondary" onClick={addGame} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                     <Plus size={18} /> 새 게임 추가하기
                   </button>
                 </div>
               </div>
            )}
          </section>
        )}

        {activeTab === 'dashboard' && (
          <section className="tab-pane fade-in">
            {/* Legend / MVP Card */}
            {topPlayers.length > 0 && (
              <div className="card mvp-card gradient-card">
                <div className="mvp-label">
                  <Crown size={26} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))' }} />
                  오늘의 테니스 킹{topPlayers.length > 1 ? 'S' : ''}
                  {topPlayers.length > 1 && (
                    <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.25)', padding: '2px 8px', borderRadius: '99px', marginLeft: '4px' }}>
                      공동 {topPlayers.length}명
                    </span>
                  )}
                </div>
                <div className="mvp-content" style={{ flexWrap: 'wrap', rowGap: '1rem' }}>
                  {topPlayers.map(tp => (
                    <div key={tp.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="mvp-avatar" style={{ overflow: 'hidden', padding: 0, width: topPlayers.length > 1 ? 52 : 60, height: topPlayers.length > 1 ? 52 : 60 }}>
                        {getMemberPhoto(tp.name)
                          ? <img src={getMemberPhoto(tp.name)} alt={tp.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <Flame size={28} />}
                      </div>
                      <div className="mvp-info">
                        <span className="mvp-name" style={{ fontSize: topPlayers.length > 1 ? '1.2rem' : '1.5rem' }}>{tp.name}</span>
                        <span className="mvp-stat">{tp.wins}승 {tp.losses}패 {tp.draws || 0}무 / {tp.points}pts 👑</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="stats-header-grid mt-4">
              <div className="card stat-mini" style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '130px' }}>
                <span className="stat-label">진행 게임</span>
                <span className="stat-val">{completedMatches.length} <small>/ {schedule.length || 0}</small></span>
                <button onClick={syncToGoogleSheets} disabled={isSyncing} className="btn btn-primary" style={{ padding: '8px', fontSize: '14px', width: '100%', marginTop: 'auto' }}>
                   {isSyncing ? '저장 중...' : '구글 시트 일괄 전송'}
                </button>
                <button onClick={resetAllData} className="btn btn-secondary" style={{ padding: '8px', fontSize: '14px', width: '100%', borderColor: '#EF4444', color: '#EF4444' }}>
                   앱 초기화
                </button>
              </div>
              <div className="card stat-mini">
                <span className="stat-label">총 획득 포인트</span>
                <span className="stat-val">{Object.values(playerStats).reduce((acc, p) => acc + p.points, 0)} pts</span>
              </div>
            </div>

            {/* Charts Section */}
            <div className="card mt-4 chart-card">
              <div className="card-header">
                <h2>실시간 포인트 랭킹 (Top 5)</h2>
                <Target size={20} className="text-primary" />
              </div>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} height={56} tick={renderRankingTick} />
                    <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="points" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {pointDiffData.length > 0 && (
              <div className="card mt-4 chart-card">
                <div className="card-header">
                  <h2>득실차 랭킹</h2>
                  <BarChart3 size={20} className="text-primary" />
                </div>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '-6px 0 8px', lineHeight: 1.5 }}>
                  획득 게임에서 잃은 게임을 뺀 값입니다. 접전보다 경기 흐름을 더 잘 보여줍니다.
                </p>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={pointDiffData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value > 0 ? '+' : ''}${value}`, '득실차']} />
                      <Bar dataKey="pointDiff" radius={[6, 6, 0, 0]}>
                        {pointDiffData.map(entry => (
                          <Cell key={entry.name} fill={entry.pointDiff >= 0 ? '#10B981' : '#EF4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {impactRanking.length > 0 && (
              <div className="card mt-4">
                <div className="card-header"><h2>경기 영향도 랭킹</h2></div>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '-6px 0 8px', lineHeight: 1.5 }}>
                  승점(승 3점, 무 1점), 득실차, 참여 경기 수를 함께 반영한 종합 지표입니다.
                </p>
                <div className="table-container">
                  <table className="stats-table">
                    <thead>
                      <tr><th>이름</th><th>승점</th><th>득실차</th><th>승률</th><th>영향도</th></tr>
                    </thead>
                    <tbody>
                      {impactRanking.map(player => (
                        <tr key={player.name}>
                          <td className="font-bold">{player.name}</td>
                          <td>{player.leaguePoints}</td>
                          <td style={{ color: player.pointDiff >= 0 ? '#10B981' : '#EF4444', fontWeight: 800 }}>
                            {player.pointDiff > 0 ? '+' : ''}{player.pointDiff}
                          </td>
                          <td>{player.winRate}%</td>
                          <td className="font-bold">{player.impactScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="chart-row mt-4">
              <div className="card flex-1 chart-card">
                <div className="card-header"><h2>승패 분포</h2></div>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '-6px 0 8px', lineHeight: 1.5 }}>
                  오늘 모든 참가자의 경기 결과를 합산한 비율이에요. 한 게임마다 승자 2명·패자 2명이 나오니, <b>승리</b>와 <b>패배</b> 합계는 항상 같고 <b>무승부</b>는 비긴 게임에 참여한 인원수예요.
                </p>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={winDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name">
                        {winDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : index === 1 ? '#F59E0B' : '#EF4444'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value}회`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '4px', fontSize: '12px', fontWeight: '700' }}>
                  {winDistribution.map((d, i) => (
                    <span key={d.name} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#475569' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '3px', display: 'inline-block', background: i === 0 ? '#10B981' : i === 1 ? '#F59E0B' : '#EF4444' }} />
                      {d.name} {d.value}회
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 오늘의 전체 경기 결과 */}
            {participationBalance.length > 0 && (
              <div className="card mt-4">
                <div className="card-header"><h2>참여 균형도</h2></div>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '-6px 0 8px', lineHeight: 1.5 }}>
                  오늘 참가자들이 얼마나 고르게 경기에 참여했는지 보여줍니다.
                </p>
                <div className="table-container">
                  <table className="stats-table">
                    <thead><tr><th>이름</th><th>참여 경기</th><th>평균 대비</th></tr></thead>
                    <tbody>
                      {participationBalance.map(player => (
                        <tr key={player.name}>
                          <td className="font-bold">{player.name}</td>
                          <td>{player.games}</td>
                          <td style={{ color: player.gap > 0 ? '#10B981' : player.gap < 0 ? '#EF4444' : '#64748B', fontWeight: 800 }}>
                            {player.gap > 0 ? '+' : ''}{player.gap}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {closeMatches.length > 0 && (
              <div className="card mt-4">
                <div className="card-header"><h2>오늘의 접전 경기</h2></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {closeMatches.slice(0, 5).map(match => (
                    <div key={match.id} style={{ padding: '10px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748B' }}>{match.id}경기</div>
                      <div style={{ fontWeight: '800', lineHeight: 1.45 }}>
                        {(match.teamA || []).join(' & ')} {match.scoreA}:{match.scoreB} {(match.teamB || []).join(' & ')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#F59E0B', marginTop: '3px', fontWeight: 700 }}>
                        {match.hasTiebreak
                          ? `타이브레이크 ${match.tiebreakA}:${match.tiebreakB}`
                          : match.scoreA === match.scoreB
                            ? '무승부 경기'
                            : `점수 차 ${match.margin}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completedMatches.length > 0 && (
              <div className="card mt-4">
                <div className="card-header"><h2>🎾 오늘의 전체 경기 결과</h2></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[...completedMatches].sort((a, b) => a.id - b.id).map(m => {
                    const aWon = m.hasTiebreak ? m.tiebreakA > m.tiebreakB : m.scoreA > m.scoreB;
                    const bWon = m.hasTiebreak ? m.tiebreakB > m.tiebreakA : m.scoreB > m.scoreA;
                    const isDraw = !aWon && !bWon;
                    const sideStyle = (won) => ({ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: won ? '900' : '600', color: won ? '#10B981' : '#0F172A' });
                    return (
                      <div key={m.id} style={{ background: '#F8FAFC', border: '1.5px solid #F1F5F9', borderRadius: '14px', padding: '12px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '8px' }}>
                          {m.id}경기{isDraw ? ' · 무승부 🤝' : ''}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                            {m.teamA.map(name => (
                              <div key={name} style={sideStyle(aWon)}>
                                <MemberAvatar photo={getMemberPhoto(name)} name={name} size={28} />
                                <span>{aWon && '🏆 '}{name}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ textAlign: 'center', minWidth: '64px' }}>
                            <div style={{ fontSize: (aWon || bWon) ? '1.6rem' : '1.3rem', fontWeight: '900', letterSpacing: '-1px' }}>
                              <span style={{ color: aWon ? '#10B981' : (isDraw ? '#F59E0B' : '#1E293B') }}>{m.scoreA}</span>
                              <span style={{ color: '#CBD5E1' }}> : </span>
                              <span style={{ color: bWon ? '#10B981' : (isDraw ? '#F59E0B' : '#1E293B') }}>{m.scoreB}</span>
                            </div>
                            {m.hasTiebreak && <div style={{ fontSize: '10px', color: '#D97706', fontWeight: '800', marginTop: '2px' }}>TB {m.tiebreakA}:{m.tiebreakB}</div>}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, alignItems: 'flex-end' }}>
                            {m.teamB.map(name => (
                              <div key={name} style={{ ...sideStyle(bWon), flexDirection: 'row-reverse' }}>
                                <MemberAvatar photo={getMemberPhoto(name)} name={name} size={28} />
                                <span>{name}{bWon && ' 🏆'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="card mt-4">
              <div className="card-header"><h2>개인별 오늘 활동 내역</h2></div>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '-6px 0 8px' }}>포인트(획득 점수) 기준으로 내림차순 정렬했어요.</p>
              <div className="table-container">
                <table className="stats-table">
                  <thead><tr><th>이름</th><th>참여</th><th>승-무-패</th><th>승률</th><th>점수</th></tr></thead>
                  <tbody>
                    {[...new Set(completedMatches.flatMap(m => [...(m.teamA||[]), ...(m.teamB||[])]))]
                      .map(a => ({ name: a, st: playerStats[a] || { games: 0, wins: 0, losses: 0, draws: 0, points: 0 } }))
                      .sort((x, y) => y.st.points - x.st.points)
                      .map(({ name: a, st }) => (
                        <tr key={a}>
                          <td className="font-bold">{a}</td>
                          <td translate="no">{st.games}</td>
                          <td translate="no">
                            <span className="text-success">{st.wins}승</span>{' '}
                            <span style={{color:'#F59E0B'}}>{st.draws||0}무</span>{' '}
                            <span style={{color:'#EF4444'}}>{st.losses}패</span>
                          </td>
                          <td translate="no">{st.games>0?Math.round(st.wins/st.games*100):0}%</td>
                          <td translate="no">{st.points}pts</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          {/* 파트너 궁합 분석 */}
          {partnerStats.length > 0 && (
            <div className="card mt-4">
              <div className="card-header"><h2>🤝 오늘의 베스트 파트너 조합</h2></div>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '-6px 0 8px' }}>승률 70% 이상(2게임 이상)인 조합은 <b style={{color:'#D97706'}}>🔥 고승률 듀오</b>로 강조했어요.</p>
              <table className="stats-table">
                <thead><tr><th>파트너 조합</th><th>게임</th><th>승</th><th>무</th><th>승률</th></tr></thead>
                <tbody>
                  {partnerStats.map((p,i) => {
                    const winRate = p.games > 0 ? Math.round(p.wins / p.games * 100) : 0;
                    const isHot = p.games >= 2 && winRate >= 70;
                    return (
                      <tr key={p.players.join('|')} style={isHot ? { background: '#FFFBEB' } : {}}>
                        <td className="font-bold">
                          {i===0?'🥇':i===1?'🥈':i===2?'🥉':'  '} {p.players.join(' & ')}
                          {isHot && <span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: '800', background: '#F59E0B', color: 'white', padding: '2px 7px', borderRadius: '99px' }}>🔥 고승률 듀오</span>}
                        </td>
                        <td>{p.games}</td>
                        <td className="text-success">{p.wins}</td>
                        <td style={{color:'#F59E0B'}}>{p.draws}</td>
                        <td style={{ fontWeight: isHot ? '900' : '700', color: isHot ? '#D97706' : '#64748b' }}>{winRate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 재미있는 개인 코멘트 */}
          {partnerMatrix.length > 0 && (
            <div className="card mt-4">
              <div className="card-header"><h2>파트너 궁합 분석</h2></div>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '-6px 0 8px', lineHeight: 1.5 }}>
                함께 뛴 조합의 승률과 득실차를 같이 보여줍니다.
              </p>
              <div className="table-container">
                <table className="stats-table">
                  <thead><tr><th>조합</th><th>경기</th><th>승률</th><th>득실차</th></tr></thead>
                  <tbody>
                    {partnerMatrix.slice(0, 8).map(pair => (
                      <tr key={pair.players.join('|')}>
                        <td className="font-bold">{pair.players.join(' & ')}</td>
                        <td>{pair.games}</td>
                        <td>{pair.winRate}%</td>
                        <td style={{ color: pair.pointDiff >= 0 ? '#10B981' : '#EF4444', fontWeight: 800 }}>
                          {pair.pointDiff > 0 ? '+' : ''}{pair.pointDiff}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {matchupStats.length > 0 && (
            <div className="card mt-4">
              <div className="card-header"><h2>상대 조합 분석</h2></div>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '-6px 0 8px', lineHeight: 1.5 }}>
                어떤 조합이 어떤 조합을 상대로 강했는지 보여줍니다.
              </p>
              <div className="table-container">
                <table className="stats-table">
                  <thead><tr><th>매치업</th><th>경기</th><th>결과</th><th>득실차</th></tr></thead>
                  <tbody>
                    {matchupStats.slice(0, 6).map(row => (
                      <tr key={row.matchup}>
                        <td className="font-bold">{row.matchup}</td>
                        <td>{row.games}</td>
                        <td>{row.teamAWins}승 / {row.draws}무 / {row.teamBWins}패</td>
                        <td style={{ color: row.pointDiff >= 0 ? '#10B981' : '#EF4444', fontWeight: 800 }}>
                          {row.pointDiff > 0 ? '+' : ''}{row.pointDiff}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {Object.values(playerStats).length > 0 && (
            <div className="card mt-4">
              <div className="card-header"><h2>😄 오늘의 TMI 코멘트</h2></div>
              <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {Object.values(playerStats).sort((a,b)=>b.wins-a.wins).map(p => (
                  <div key={p.name} style={{display:'flex',alignItems:'center',gap:'12px',padding:'8px',background:'#F8FAFC',borderRadius:'10px'}}>
                    <span style={{fontWeight:'800',minWidth:'60px'}}>{p.name}</span>
                    <span style={{fontSize:'13px',color:'#475569'}}>{tmiComments[p.name] || ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 내보내기 + 기록 저장 버튼 */}
          <div className="card mt-4" style={{textAlign:'center'}}>
            <div className="card-header"><h2>📤 경기 결과 공유하기</h2></div>
            <p style={{fontSize:'13px',color:'#64748b',marginBottom:'12px'}}>HTML 파일로 저장 후 카카오톡에 공유하세요!</p>
            <button onClick={exportDashboard} className="btn btn-primary" style={{width:'100%',padding:'14px',fontSize:'15px',background:'linear-gradient(135deg,#4F46E5,#7C3AED)'}}>
              📥 경기 결과 HTML 다운로드
            </button>
            <button onClick={saveSession} className="btn btn-secondary mt-3" style={{width:'100%',padding:'12px',fontSize:'14px'}}>
              💾 기록 탭에 날짜별로 저장
            </button>
          </div>
          </section>
        )}

        {activeTab === 'history' && (
          <section className="section">
            {selectedSession ? (
              <div>
                <button onClick={() => setSelectedSession(null)} className="btn btn-secondary" style={{marginBottom:'16px'}}>
                  ← 목록으로
                </button>
                <div className="card">
                  <div className="card-header">
                    <h2>📅 {selectedSession.session_date} 경기 기록</h2>
                    <span style={{fontSize:'13px',color:'#64748b'}}>참석 {(selectedSession.attendees||[]).length}명 · {(selectedSession.matches||[]).filter(m=>m.isCompleted).length}경기 완료</span>
                  </div>
                  <table className="stats-table" style={{marginTop:'12px'}}>
                    <thead><tr><th>이름</th><th>참여</th><th>승-무-패</th><th>승률</th><th>점수</th></tr></thead>
                    <tbody>
                      {Object.values(selectedSession.stats||{}).sort((a,b)=>b.points-a.points).map(st => (
                        <tr key={st.name}>
                          <td className="font-bold">{st.name}</td>
                          <td>{st.games}</td>
                          <td><span className="text-success">{st.wins}승</span> <span style={{color:'#F59E0B'}}>{st.draws||0}무</span> <span style={{color:'#EF4444'}}>{st.losses}패</span></td>
                          <td>{st.games>0?Math.round(st.wins/st.games*100):0}%</td>
                          <td>{st.points}pts</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card mt-4">
                  <div className="card-header"><h2>🎾 경기 결과</h2></div>
                  {(selectedSession.matches||[]).filter(m=>m.isCompleted).map(m => (
                    <div key={m.id} style={{padding:'10px 0',borderBottom:'1px solid #F1F5F9',display:'flex',alignItems:'center',gap:'8px',fontSize:'14px'}}>
                      <span style={{minWidth:'50px',color:'#64748b'}}>{m.id}경기</span>
                      <span style={{flex:1,textAlign:'right'}}>{(m.teamA||[]).join(' & ')}</span>
                      <span style={{fontWeight:'900',fontSize:'18px',padding:'0 8px'}}>{m.scoreA}:{m.scoreB}</span>
                      <span style={{flex:1}}>{(m.teamB||[]).join(' & ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="card-header" style={{marginBottom:'12px'}}><h2>📋 날짜별 경기 기록</h2></div>
                {sessions.length === 0 ? (
                  <div className="card" style={{textAlign:'center',padding:'40px',color:'#94A3B8'}}>
                    <p style={{fontSize:'32px',marginBottom:'8px'}}>📂</p>
                    <p>저장된 기록이 없습니다.</p>
                    <p style={{fontSize:'13px',marginTop:'8px'}}>대시보드 하단의 "기록 탭에 날짜별로 저장" 버튼을 누르면 이곳에 쌓입니다.</p>
                  </div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                    {sessions.map(s => (
                      <div key={s.id} onClick={() => setSelectedSession(s)}
                        className="card" style={{cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px'}}>
                        <div>
                          <div style={{fontWeight:'800',fontSize:'15px'}}>{s.session_date}</div>
                          <div style={{fontSize:'13px',color:'#64748b',marginTop:'2px'}}>
                            참석 {(s.attendees||[]).length}명 · {(s.matches||[]).filter(m=>m.isCompleted).length}경기
                          </div>
                        </div>
                        <span style={{color:'#94A3B8',fontSize:'20px'}}>›</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === 'live' && liveMatchId && (() => {
          const match = schedule.find(m => m.id === liveMatchId);
          if (!match) { setLiveMatchId(null); setActiveTab('schedule'); return null; }
          
          const ringStyle = {
            position: 'absolute', top: '-12px', width: '14px', height: '24px',
            border: '3px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.2)', zIndex: 2
          };
          
          // 타이브레이크 가능 여부: 게임이 5:5 또는 6:6 이상 동점
          const canStartTiebreak = !isTiebreak && match.scoreA === match.scoreB && match.scoreA >= 5;

          return (
            <section className="tab-pane fade-in">
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px' }}>
                  {match.id}경기 라이브 점수판
                  {isTiebreak && <span style={{fontSize:'14px',background:'#FEF3C7',color:'#D97706',padding:'2px 10px',borderRadius:'99px',marginLeft:'8px',fontWeight:'800'}}>🏆 TIEBREAK</span>}
                </h2>
                <p className="text-sm text-muted">
                  {isTiebreak ? '타이브레이크: 1점씩 올라갑니다.' : '테니스 룰(0, 15, 30, 40, AD)이 적용되었습니다.'}
                </p>
              </div>
              
              {/* Wooden Scoreboard */}
              <div style={{
                background: 'linear-gradient(135deg, #e4c590 0%, #c19a6b 100%)',
                borderRadius: '8px', padding: '24px 16px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                margin: '0 auto', maxWidth: '600px', position: 'relative', border: '2px solid #a37c4d'
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '12px' }}>
                  
                  {/* Team A Games (Large Black) */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#78350f', marginBottom: '8px' }}>GAME</span>
                    <div style={{ background: '#fdf6e3', width: '80px', height: '110px', borderRadius: '6px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '64px', fontWeight: 'bold', color: '#1a1a1a', position: 'relative', fontFamily: 'monospace' }}>
                      <div style={{ ...ringStyle, left: '15px' }} /><div style={{ ...ringStyle, right: '15px' }} />
                      {match.scoreA}
                    </div>
                  </div>
                  
                  {/* Team A Points (Small Black) */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#78350f', marginBottom: '8px' }}>POINT</span>
                    <div style={{ background: '#fdf6e3', width: '60px', height: '90px', borderRadius: '6px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '38px', fontWeight: 'bold', color: '#1a1a1a', position: 'relative', fontFamily: 'monospace' }}>
                      <div style={{ ...ringStyle, left: '10px' }} /><div style={{ ...ringStyle, right: '10px' }} />
                      {POINT_VALUES[livePoints.A]}
                    </div>
                  </div>
                  
                  <div style={{ width: '8px' }} /> {/* Middle Gap */}
                  
                  {/* Team B Points (Small Green) */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#78350f', marginBottom: '8px' }}>POINT</span>
                    <div style={{ background: '#fdf6e3', width: '60px', height: '90px', borderRadius: '6px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '38px', fontWeight: 'bold', color: '#16a34a', position: 'relative', fontFamily: 'monospace' }}>
                      <div style={{ ...ringStyle, left: '10px' }} /><div style={{ ...ringStyle, right: '10px' }} />
                      {POINT_VALUES[livePoints.B]}
                    </div>
                  </div>
                  
                  {/* Team B Games (Large Green) */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#78350f', marginBottom: '8px' }}>GAME</span>
                    <div style={{ background: '#fdf6e3', width: '80px', height: '110px', borderRadius: '6px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '64px', fontWeight: 'bold', color: '#16a34a', position: 'relative', fontFamily: 'monospace' }}>
                      <div style={{ ...ringStyle, left: '15px' }} /><div style={{ ...ringStyle, right: '15px' }} />
                      {match.scoreB}
                    </div>
                  </div>
                  
                </div>
                
                {/* PASSING Logo */}
                <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '20px', fontWeight: '900', color: '#9333ea', letterSpacing: '2px', fontFamily: 'sans-serif' }}>
                  <span style={{ color: '#c084fc' }}>♣</span> PASSING <span style={{ color: '#c084fc' }}>♥</span>
                </div>

                {/* Name Tags & Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', padding: '0 10px' }}>
                  <div style={{ textAlign: 'center', width: '48%' }}>
                    <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#1a1a1a', borderBottom: '3px solid #1a1a1a', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                      {match.teamA.map(name => (
                        <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <MemberAvatar photo={getMemberPhoto(name)} name={name} size={26} />
                          {name}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px', justifyContent: 'center' }}>
                      {isTiebreak ? (
                        <>
                          <button onClick={() => decrementTiebreak('A')} className="btn btn-secondary" style={{ padding: '8px 12px', flex: 1 }}>- TB</button>
                          <button onClick={() => incrementTiebreak('A')} className="btn btn-primary" style={{ padding: '8px 12px', flex: 1, backgroundColor: '#D97706' }}>+ TB</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => decrementPoint('A')} className="btn btn-secondary" style={{ padding: '8px 12px', flex: 1 }}>- Pt</button>
                          <button onClick={() => incrementPoint('A')} className="btn btn-primary" style={{ padding: '8px 12px', flex: 1, backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' }}>+ Pt</button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center', width: '48%' }}>
                    <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', color: '#16a34a', borderBottom: '3px solid #16a34a', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                      {match.teamB.map(name => (
                        <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <MemberAvatar photo={getMemberPhoto(name)} name={name} size={26} />
                          {name}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '8px', justifyContent: 'center' }}>
                      {isTiebreak ? (
                        <>
                          <button onClick={() => decrementTiebreak('B')} className="btn btn-secondary" style={{ padding: '8px 12px', flex: 1 }}>- TB</button>
                          <button onClick={() => incrementTiebreak('B')} className="btn btn-primary" style={{ padding: '8px 12px', flex: 1, backgroundColor: '#16a34a' }}>+ TB</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => decrementPoint('B')} className="btn btn-secondary" style={{ padding: '8px 12px', flex: 1 }}>- Pt</button>
                          <button onClick={() => incrementPoint('B')} className="btn btn-primary" style={{ padding: '8px 12px', flex: 1, backgroundColor: '#16a34a', borderColor: '#16a34a' }}>+ Pt</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tiebreak 시작 / 취소 버튼 */}
                <div style={{ marginTop: '16px', padding: '0 10px' }}>
                  {canStartTiebreak && (
                    <button
                      onClick={startTiebreak}
                      style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', color:'white', border:'none', borderRadius:'8px', padding:'10px 24px', fontWeight:'800', fontSize:'14px', cursor:'pointer', width:'100%', letterSpacing:'0.5px' }}
                    >
                      🏆 타이브레이크 시작 ({match.scoreA}:{match.scoreB})
                    </button>
                  )}
                  {isTiebreak && (
                    <div style={{display:'flex', gap:'8px', marginTop: canStartTiebreak ? '8px' : '0'}}>
                      <div style={{flex:1, background:'#FEF3C7', borderRadius:'8px', padding:'10px', textAlign:'center', fontWeight:'800', fontSize:'15px', color:'#92400e'}}>
                        TB: <span style={{color:'#1a1a1a', fontSize:'18px'}}>{tiebreakPoints.A}</span> : <span style={{color:'#16a34a', fontSize:'18px'}}>{tiebreakPoints.B}</span>
                      </div>
                      <button onClick={cancelTiebreak} style={{background:'#FEE2E2',color:'#DC2626',border:'none',borderRadius:'8px',padding:'10px 14px',fontWeight:'700',fontSize:'13px',cursor:'pointer', flexShrink:0}}>취소</button>
                    </div>
                  )}
                </div>

                {/* Manual Game Adjustments */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '0 10px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => updateScore(match.id, 'A', -1)} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.2)', padding: '4px 8px', fontSize: '12px', borderRadius: '4px' }}>- Game</button>
                    <button onClick={() => updateScore(match.id, 'A', 1)} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.2)', padding: '4px 8px', fontSize: '12px', borderRadius: '4px' }}>+ Game</button>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => updateScore(match.id, 'B', -1)} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.2)', padding: '4px 8px', fontSize: '12px', borderRadius: '4px' }}>- Game</button>
                    <button onClick={() => updateScore(match.id, 'B', 1)} style={{ background: 'transparent', border: '1px solid rgba(0,0,0,0.2)', padding: '4px 8px', fontSize: '12px', borderRadius: '4px' }}>+ Game</button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6">
                {isTiebreak && (
                  <div style={{textAlign:'center', marginBottom:'12px', padding:'10px', background:'#FEF3C7', borderRadius:'10px', fontWeight:'700', color:'#92400e'}}>
                    🏆 타이브레이크 진행 중 · {match.scoreA}:{match.scoreB} (TB {tiebreakPoints.A}:{tiebreakPoints.B})
                  </div>
                )}
                <button onClick={() => saveMatchResult(match)} className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px' }}>
                  경기 종료 및 결과 저장
                </button>
                <button onClick={() => setActiveTab('schedule')} className="btn btn-secondary mt-3" style={{ width: '100%', padding: '12px' }}>
                  일정으로 돌아가기
                </button>
              </div>
            </section>
          );
        })()}
      </main>
    </div>
  );
}