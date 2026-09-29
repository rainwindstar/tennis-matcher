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
  'Í∞ïÍ≤Ω??: '/photos_real/Í∞ïÍ≤Ω??jpg',
  'ÍπÄÍ¥Ä??: '/photos_real/ÍπÄÍ¥Ä??jpg',
  'ÍπÄ?êÏàò': '/photos_real/ÍπÄ?êÏàò.jpg',
  'Î∞ïÏ≤ú??: '/photos_real/Î∞ïÏ≤ú??jpg',
  '?úÏòÅÍµ?: '/photos_real/?úÏòÅÍµ?jpg',
  '?§ÏÑ∏Íµ?: '/photos_real/?§ÏÑ∏Íµ?jpg',
  '?¥Ïû•ÎØ?: '/photos_real/?¥Ïû•ÎØ?jpg',
  '?¥ÌõàÏ§Ä': '/photos_real/?¥ÌõàÏ§Ä.jpg',
  'ÏµúÏÑ±Î∂Ä': '/photos_real/ÏµúÏÑ±Î∂Ä.jpg',
  '?àÍ≤Ω??: '/photos_real/?àÍ≤Ω??jpg',
  '?¥Îèô??: '/photos_real/?¥Îèô??jpg',
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
  'Í∞ïÍ≤Ω??, 'ÍπÄ?êÏàò', '?úÏòÅÍµ?, 'ÍπÄÍ¥Ä??, '?§ÏÑ∏Íµ?,
  '?¥Ïû•ÎØ?, 'Î∞ïÏ≤ú??, '?¥Îèô??, '?¥ÌõàÏ§Ä', 'ÏµúÏÑ±Î∂Ä', '?àÍ≤Ω??
];

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// ?πÎ•† Íµ¨Í∞ÑÎ≥?TMI ÏΩîÎ©ò???Ä 50Í∞???Î∂ÑÍ∏∞(Q1~Q4)Î≥ÑÎ°ú ?úÏûë ?§ÌîÑ?ãÏù¥ ?¨Îùº??Í≥ÑÏ†àÎßàÎã§ ?§Î•∏ ÏΩîÎ©ò?∏Í? Î®ºÏ? ?òÏò¥
const ALL_FUN_COMMENTS = {
  none: [
    '?ÑÏßÅ Î™??ÄÍ∏?Ï§?.. ?§Îäò???§ÌÅ¨?∏Ïä§ ?ÄÍ∏?Ï§??ê¥',
    '?åÎ∞ç??Î™®Îìú ON. ÏßÑÏßú ?§Î†•?Ä ÏßÄÍ∏àÎ????éØ',
    'Í≤ΩÍ∏∞ ???†ÎπÑÏ£ºÏùò ?ÑÎûµ? Î™®ÎëêÍ∞Ä Ï£ºÎ™© Ï§???',
    '?ÑÏßÅ Î≤†Ïùº???∏Ïù∏ ?§Î†•... ?§Îäò Í≥µÍ∞ú ?àÏ†ï ?é≠',
    'ÏΩîÌä∏ ?ÅÏùë Ï§? ?ºÏºìÍ≥?ÏπúÌï¥ÏßÄ???úÍ∞Ñ ?ÑÏöî ?§ù',
    '?±Ïû• ??Ï∂©Ï†Ñ ?ÑÎ£å Ï§?.. Î∞∞ÌÑ∞Î¶?100% ?îã',
  ],
  high: [
    '?§Îäò ?ºÏºì??GPS ?¨Ïïò?òÏöî? Í≥µÏù¥ ??Ï∞æÏïÑÍ∞Ä???éØ',
    '?πÏãú ?¥Ï†ØÎ∞?ÏΩîÌä∏?êÏÑú ?ºÏûê ?∞Ïäµ?àÎÇò?? ???¥Î†áÍ≤??òÌï¥ ?ò§',
    '?ÅÎ??Ä???§Ìä∏ ?òÍ∏∞ ?êÎ†§?åÌïò??Í≤??êÍª¥ÏßÑÎã§ ?èÜ',
    '??Î∂?ÎßûÏ? Í≥µÏ? ?¨Ìåê??"??" ?òÎäî Ï§??òÆ',
    '?πÎ¶¨?îÏ†ï???ÑÎãà???πÎ¶¨Ï≤úÏÇ¨Í∏? ?òÎäò?êÏÑú ?¥Î†§?îÎÇò???èÖ',
    '?§Îäò Î™®Îì† Í≥µÏù¥ "?Ä ?°ÏïÑÏ£ºÏÑ∏?? ?òÎ©∞ ?§Îäî Í≤?Í∞ôÏùå ?éæ',
    'ÏΩîÌä∏ ?ÑÏùò ÏßÄÎ∞∞Ïûê. ?ÅÎ?Î∞??†Í??ºÏä§Í∞Ä Î∞òÏÇ¨?òÎäî Ï§??òé',
    '?Ä ?¨Îûå ?ºÏºì??AI Ïπ?Î∞ïÌ??àÎäî Í±??ÑÎãåÍ∞Ä?? ?§ñ',
    '?ÑÎ≤Ω???? ?ÑÎ≤Ω???? ?§Îäò ÏµúÍ∞ï???∏Ï†ï ?ëë',
    '?åÎãà???†Ïù¥ Í∞ïÎ¶º?òÏÖ®?µÎãà?? Î™®Îëê Í≤ΩÎ∞∞ ?ôè',
  ],
  midHigh: [
    '?ÅÏäπ??ÎØ∏Ï≥§?? ?§Îäò Î∂ÑÏúÑÍ∏??¨ÏÉÅÏπ??äÏùå ?î•',
    '?∞Ïäπ Î≥∏Îä•??Í∞ÅÏÑ± Ï§? ?§Ïùå ?ÅÎ? Ï°∞Ïã¨?? ?í™',
    'Ïª®Îîî??100??ÎßåÏ†ê??99?? ?òÎ®∏ÏßÄ 1?êÏ? Í≤∏ÏÜê ?òè',
    '?¥Í∏∞??Îß??ÑÎäî ?¨Îûå ?πÏú†???¨Ïú†Î°úÏ? ??,
    '?§Îäò ?úÎ∏å ?§Ïñ¥Í∞??åÎßà???ÅÎ??Ä ?úÏà® ?åÎ¶¨ ?§Î¶º ?òÖ',
    '?§Î†• ?ÅÌñ• Ï§? ?§Ïùå ?¨Ïóî ÏΩîÏπò ?êÍ≤©Ï¶??∞Ïã§ Í∏∞ÏÑ∏ ?ìú',
    'ÏΩîÌä∏ ???ºÌÑ∞?¨Ïõå?? Î≥?Î∞∞Í∏â???®Îã§Î•¥Îã§ ?éØ',
    '?§Îäò Í≤ΩÍ∏∞ ?ÅÏÉÅ Ï∞çÏñ¥?êÎäî Í±?Ï∂îÏ≤ú. ?òÏ§ë???????àÏùå ?ìπ',
  ],
  even: [
    '?¥Í∏∞Í≥?ÏßÄÍ≥?.. ÏΩîÌä∏ ???∏ÏÉù Ï≤†Ìïô???ñÔ∏è',
    '?πÍ≥º ???¨Ïù¥ ?ÑÎ≤Ω??Í∑†Ìòï??ÎØ∏Ìïô ?ßò',
    'Î∞òÎ∞ò ÏπòÌÇ® Í∞ôÏ? ?§Îäò???±Ï†Å. Í∑ºÎç∞ ÎßõÏûà?ñÏïÑ???çó',
    '?¥Î∂Ñ ?πÏãú ?πÎ•† 50% ?†Ï?Í∞Ä Î™©Ìëú?∏Í??? ?Ä?çÎèÑÎ°??ïÌôï???é™',
    '?§Îäò ÏΩîÌä∏ ?ÑÏùò ?úÏÜåÍ≤åÏûÑ ?¥Îãπ. ?àÎ¨ò??Í∑†Ìòï ?é≠',
    '?¥Í∏∞Í≥?ÏßÄ??Í≤?Î∞òÎ∞ò?∏Îç∞ ???¥Î†áÍ≤?Ïø®Ìï¥ Î≥¥Ïù¥ÏßÄ? ?òé',
    'ÏΩîÌä∏???åÏñë Ï°∞Ìôî. ?¥Í∏∞Î©?Ï¢ãÍ≥† ?∏ÎèÑ Ïø®Ìïú ?êÌÉú ??∏è',
    '50% ?πÎ•†... ?πÏãú ?ÅÎ?Î∞?Î∞∞Î†§?òÎäî Í±¥Í??? ?§î',
  ],
  midLow: [
    'Ï∞©Ïã§???¥Í≥µ ?ìÎäî Ï§? ?§Ïùå Í≤åÏûÑ?Ä Î∞òÎìú???§Î¶Ñ ?í™',
    '?§Îäò?Ä ?∞Ïäµ, ?§Ïùå???§Ï†Ñ! ?∞Ïù¥???òÏßë ?ÑÎ£å ?ìä',
    'Í¥úÏ∞Æ?ÑÏöî, ?òÎã¨??Îß§Î≤à ?¥Í∏¥ Í±??ÑÎãà?êÏöî (?ÑÎßà?? ?òå',
    'ÏßÄÍ∏?ÏßÄÍ≥??àÏ?Îß??úÏ†ï?Ä ?¥Î? ?πÎ¶¨??Í∞ôÏùå ?òÑ',
    '?§Îäò Ïß?Í≤åÏûÑ?êÏÑú Î∞∞Ïö¥ Í≤ÉÏù¥ ?¥Í∏¥ Í≤åÏûÑÎ≥¥Îã§ ÎßéÏ? Î≤??ìö',
    '?®Î∞∞Î•?Í±∞Î¶Ñ ?ºÏïÑ ?¥Ïùº ÍΩ??ºÏö∏ ?àÏ†ï ?å∏',
    '?ÑÏû¨ ?¨Ï∂©??Ï§? Î∞∞ÌÑ∞Î¶?Ï∂©Ï†Ñ??47% ?îã',
    'ÎØ∏Îûò??MVPÍ∞Ä ÏßÄÍ∏??¥Ïã¨???®Î∞∞Î•?ÎßõÎ≥¥Í≥??àÎäî Ï§???',
    '?§Îäò Ïª®Îîî?òÏù¥ ?¥Ïßù... Í∑ºÎç∞ ?úÏ†ïÎßåÏ? ?êÏù¥???ò§',
    '?§Ïùå Í≤åÏûÑ?êÏÑú ?§Îäò ?§Ïöï Í∏∞Î??©Îãà?? ?éØ',
  ],
  low: [
    '?§Îäò?Ä Ïª®Îîî?òÏù¥ Ï¢Ä... ÏΩîÌä∏???†Ïù¥ ?†Ïãú ?¥Í? Ï§??èñÔ∏?,
    'Í≥µÏù¥ ?êÍæ∏ ?§Î•∏ ÏΩîÌä∏Î°??Ä??Í∞Ä??Ï§??èÉ',
    '?§ÎäòÎß??†Ïù∏Í∞Ä?? ?¥Ïùº?Ä Î∂ÑÎ™Ö ?§Î? Í≤ÅÎãà?? ?åÖ',
    '?ºÏºì??Î®ºÏ? ??≥µ ?†Ïñ∏???àÎÇòÎ¥êÏöî ?è≥Ô∏?,
    '?§Îäò ?†Ïî® ?ìÏúºÎ°??åÎ¶¨Í≥??∂Ï? ?¨Ï†ï ?ÑÎãåÍ∞Ä?? ?åßÔ∏?,
    'ÏΩîÌä∏Í∞Ä ?§Îäò?∞Îùº ?¥ÏÉÅ?òÍ≤å Í∏∞Ïö∏?¥ÏßÑ ?êÎÇå ?§î',
    '?§Ïùå Í≤åÏûÑ Î©ãÏ?Í≤??§Ïöï??Í∞ÄÏ¶àÏïÑ! ?î•',
    '?§Îäò Ïß?Í≤ÉÎ≥¥???ûÏúºÎ°??¥Í∏∏ Í≤???ÎßéÏäµ?àÎã§ ?îÏù¥???íô',
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
  
  // Íµ¨Í? ?úÌä∏ ?πÏï± URL (?¨Ïö©?êÍ? ?§ÌÅ¨Î¶ΩÌä∏ Î∞∞Ìè¨ ???¨Í∏∞???ÖÎ†•)
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
    // Ï∂úÏÑù Î™ÖÎã®?êÏÑú???¥Î¶Ñ ?ÖÎç∞?¥Ìä∏
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

  // === ÏπúÍµ¨?§Í≥º ?§ÏãúÍ∞ÑÏúºÎ°?Í≥µÏú†?òÎäî ?ÅÌÉú ?ôÍ∏∞??(InsForge: tennis_shared_state ?®Ïùº ?? ===
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

  // ÏµúÏ¥à Î°úÎìú: ?úÎ≤Ñ Í≥µÏú† ?ÅÌÉúÎ•?Í∞Ä?∏Ï? Î∞òÏòÅ?òÍ±∞?? ?úÎ≤ÑÍ∞Ä ÎπÑÏñ¥?àÏúºÎ©???Î°úÏª¨ ?∞Ïù¥?∞Î? ?úÎìúÎ°??ÖÎ°ú??
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

  // Î≥ÄÍ≤??¨Ìï≠???îÎ∞î?¥Ïä§ ???úÎ≤Ñ???ÖÎ°ú??(?¥Í? Í∏∞Î°ù Ï§??ÑÎ£å???¥Ïö©??ÏπúÍµ¨?§ÏóêÍ≤??ÑÌåå)
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

  // ÏπúÍµ¨?§Ïùò Î≥ÄÍ≤ΩÏÇ¨??ùÑ Ï£ºÍ∏∞?ÅÏúºÎ°??ïÏù∏??Î∞òÏòÅ (5Ï¥??¥ÎßÅ)
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

  // Í≤ΩÍ∏∞ Í∏∞Î°ù Î™©Î°ù Î°úÎìú
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_INSFORGE_URL}/api/database/records/tennis_sessions?order=session_date.desc`, {
          headers: { Authorization: `Bearer ${import.meta.env.VITE_INSFORGE_ANON_KEY}` },
        });
        if (res.ok) setSessions(await res.json());
      } catch { /* ?§ÌîÑ?ºÏù∏ ??Î¨¥Ïãú */ }
    })();
  }, []);

  // ?Ä?¥Î∏å?àÏù¥???úÏûë
  const startTiebreak = () => {
    setIsTiebreak(true);
    setTiebreakPoints({ A: 0, B: 0 });
    setLivePoints({ A: 0, B: 0 });
  };

  // ?Ä?¥Î∏å?àÏù¥???êÏàò ?¨Î¶¨Í∏?(?ºÎ∞ò ?´Ïûê 1??
  const incrementTiebreak = (team) => {
    setTiebreakPoints(prev => ({
      ...prev,
      [team]: prev[team] + 1
    }));
  };

  // ?Ä?¥Î∏å?àÏù¥???êÏàò ?¥Î¶¨Í∏?
  const decrementTiebreak = (team) => {
    setTiebreakPoints(prev => ({
      ...prev,
      [team]: Math.max(0, prev[team] - 1)
    }));
  };

  // ?Ä?¥Î∏å?àÏù¥??Ï∑®ÏÜå
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
      { name: '?πÎ¶¨', value: wins },
      { name: 'Î¨¥ÏäπÎ∂Ä', value: draws },
      { name: '?®Î∞∞', value: losses }
    ];
  }, [playerStats]);

  // ?åÌä∏??Í∂ÅÌï© Î∂ÑÏÑù
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

  // TMI ÏΩîÎ©ò?? ???†ÏàòÎ•??úÍ∫ºÎ≤àÏóê Í≥ÑÏÇ∞???∏ÏÖò ??Ï§ëÎ≥µ??Î∞©Ï??òÍ≥† Î∂ÑÍ∏∞Î≥??§ÌîÑ???ÅÏö©
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

  // Í≤ΩÍ∏∞ Í∏∞Î°ù ?Ä??
  const saveSession = async () => {
    if (completedMatches.length === 0) { alert('?Ä?•Ìï† Í≤ΩÍ∏∞ Í≤∞Í≥ºÍ∞Ä ?ÜÏäµ?àÎã§.'); return; }
    try {
      const payload = { session_date: matchDate, attendees, matches: completedMatches, stats: playerStats };
      const res = await fetch(`${import.meta.env.VITE_INSFORGE_URL}/api/database/records/tennis_sessions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${import.meta.env.VITE_INSFORGE_ANON_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert('Í≤ΩÍ∏∞ Í∏∞Î°ù???Ä?•Îêò?àÏäµ?àÎã§!');
        const listRes = await fetch(`${import.meta.env.VITE_INSFORGE_URL}/api/database/records/tennis_sessions?order=session_date.desc`, {
          headers: { Authorization: `Bearer ${import.meta.env.VITE_INSFORGE_ANON_KEY}` },
        });
        if (listRes.ok) setSessions(await listRes.json());
      } else { alert('?Ä?•Ïóê ?§Ìå®?àÏäµ?àÎã§.'); }
    } catch { alert('?Ä?•Ïóê ?§Ìå®?àÏäµ?àÎã§.'); }
  };

  // HTML ?Ä?úÎ≥¥???¥Î≥¥?¥Í∏∞
  const exportDashboard = () => {
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const today = new Date().toLocaleDateString('ko-KR', {year:'numeric',month:'long',day:'numeric'});
    const topP = Object.values(playerStats).sort((a,b)=>b.wins-a.wins||b.points-a.points)[0];
    const matchPlayers = [...new Set(completedMatches.flatMap(m => [...(m.teamA||[]), ...(m.teamB||[])]))];
    const rows = matchPlayers.map(a => {
      const st = playerStats[a]||{games:0,wins:0,losses:0,draws:0,points:0};
      const wr = st.games>0 ? Math.round(st.wins/st.games*100) : 0;
      return `<tr><td><b>${a}</b></td><td>${st.games}</td><td style="color:#10B981">${st.wins}??/td><td style="color:#EF4444">${st.losses}??/td><td style="color:#F59E0B">${st.draws||0}Î¨?/td><td>${st.points}pts</td><td>${wr}%</td></tr>`;
    }).join('');
    const matchRows = completedMatches.map(m => {
      const res = m.scoreA>m.scoreB?'A?Ä ??:'';
      const res2 = m.scoreB>m.scoreA?'B?Ä ??:res;
      const result = m.scoreA===m.scoreB?'Î¨¥ÏäπÎ∂Ä':res2;
      return `<tr><td>${m.id}Í≤ΩÍ∏∞</td><td>${m.teamA.join(', ')}</td><td style="font-size:20px;font-weight:900">${m.scoreA} : ${m.scoreB}</td><td>${m.teamB.join(', ')}</td><td>${result}</td></tr>`;
    }).join('');
    const pairRows = partnerStats.map(p => `<tr><td><b>${p.players.join(' & ')}</b></td><td>${p.games}</td><td>${p.wins}??/td><td>${p.draws}Î¨?/td></tr>`).join('');
    const html = `<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>?éæ ?åÎãà??Í≤ΩÍ∏∞ Í≤∞Í≥º - ${today}</title>
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
<h1>?éæ ?åÎãà??Í≤ΩÍ∏∞ Í≤∞Í≥º</h1>
<p class="date">${today} ¬∑ Ï¥?${completedMatches.length}Í≤åÏûÑ</p>
${topP ? `<div class="mvp"><div>?èÜ ?§Îäò???åÎãà????</div><div class="name">${topP.name}</div><div class="stat">${topP.wins}??${topP.losses}??${topP.draws||0}Î¨?/ ${topP.points}pts</div></div>` : ''}
<div class="card"><h2>?ìä Í≤ΩÍ∏∞ Í≤∞Í≥º</h2>
<table><thead><tr><th>Í≤ΩÍ∏∞</th><th>A?Ä</th><th>?§ÏΩî??/th><th>B?Ä</th><th>Í≤∞Í≥º</th></tr></thead>
<tbody>${matchRows}</tbody></table></div>
<div class="card"><h2>?ë§ Í∞úÏù∏ Í∏∞Î°ù</h2>
<table><thead><tr><th>?¥Î¶Ñ</th><th>Ï∞∏Ïó¨</th><th>??/th><th>??/th><th>Î¨?/th><th>?êÏàò</th><th>?πÎ•†</th></tr></thead>
<tbody>${rows}</tbody></table></div>
${pairRows ? `<div class="card"><h2>?§ù Î≤†Ïä§???åÌä∏??/h2><table><thead><tr><th>Ï°∞Ìï©</th><th>Í≤åÏûÑ</th><th>??/th><th>Î¨?/th></tr></thead><tbody>${pairRows}</tbody></table></div>` : ''}
<footer>Tennis Matcher Pro ¬∑ ${today}</footer>
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
    if (guestName.trim() && !attendees.includes(`${guestName.trim()}(Í≤åÏä§??`)) {
      setAttendees([...attendees, `${guestName.trim()}(Í≤åÏä§??`]);
      setGuestName('');
    }
  };

  const generateFullSchedule = (targetGames) => {
    const N = attendees.length;
    if (N < 4) {
      alert("Îß§Ïπ≠???ÑÌï¥ ÏµúÏÜå 4Î™ÖÏù¥ ?ÑÏöî?©Îãà??");
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
    if (window.confirm(`${matchId}Î≤?Í≤ΩÍ∏∞Î•???†ú?òÏãúÍ≤†Ïäµ?àÍπå?`)) {
      setSchedule(prev => prev.filter(m => m.id !== matchId));
      setCompletedMatches(prev => prev.filter(m => m.id !== matchId));
      if (editingMatchId === matchId) cancelEditMatch();
    }
  };

  // ?Ä?•Îêú Í≤ΩÍ∏∞ Í≤∞Í≥ºÎ•??§Ïãú ÏßÑÌñâ ?ÅÌÉúÎ°??òÎèå???êÏàò/Î©§Î≤ÑÎ•??¨ÏûÖ?•Ìï† ???àÍ≤å ??
  const reopenMatch = (matchId) => {
    if (!window.confirm(`${matchId}Î≤?Í≤ΩÍ∏∞ Í≤∞Í≥ºÎ•??òÏ†ï?òÏãúÍ≤†Ïäµ?àÍπå?\n?Ä?•Îêú Í≤∞Í≥ºÍ∞Ä Ï¥àÍ∏∞?îÎêòÍ≥? ?êÏàò?Ä Î©§Î≤ÑÎ•??§Ïãú ?ÖÎ†•????[Í≤∞Í≥º Î°úÏª¨ ?Ä?????åÎü¨??Î∞òÏòÅ?©Îãà??`)) return;
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
    const tbInfo = isTiebreak ? ` (?Ä?¥Î∏å?àÏù¥??${tiebreakPoints.A}:${tiebreakPoints.B})` : '';
    const isConfirmed = window.confirm(`${match.id}Î≤?Í≤ΩÍ∏∞ Í≤∞Í≥ºÎ•??Ä?•Ìïò?úÍ≤†?µÎãàÍπ?\nÍ≤åÏûÑ: ${match.scoreA}:${match.scoreB}${tbInfo}\n(Î°úÏª¨???Ä?•ÎêòÎ©? ?ÑÏ≤¥ Í≤ΩÍ∏∞Í∞Ä ?ùÎÇòÎ©??Ä?úÎ≥¥????óê??Íµ¨Í? ?úÌä∏Î°??ºÍ¥Ñ ?Ä?•Ìï¥ Ï£ºÏÑ∏??`);
    if (!isConfirmed) return;

    const completedMatch = {
      ...match,
      isCompleted: true,
      timestamp: new Date(),
      hasTiebreak: isTiebreak,
      tiebreakA: isTiebreak ? tiebreakPoints.A : null,
      tiebreakB: isTiebreak ? tiebreakPoints.B : null,
    };
    
    // Î°úÏª¨ ?ÅÌÉú Î®ºÏ? ?ÖÎç∞?¥Ìä∏ (Îπ†Î•∏ UI Î∞òÏùë)
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
      alert('?Ä?•Ìï† ?ÑÎ£å??Í≤ΩÍ∏∞Í∞Ä ?ÜÏäµ?àÎã§.');
      return;
    }
    
    const isConfirmed = window.confirm(`Ï¥?${completedMatches.length}Í∞úÏùò Í≤ΩÍ∏∞ Í≤∞Í≥ºÎ•?Íµ¨Í? ?úÌä∏???ºÍ¥Ñ ?Ä?•Ìïò?úÍ≤†?µÎãàÍπ?`);
    if (!isConfirmed) return;
    
    setIsSyncing(true);
    try {
      const promises = completedMatches.map(completedMatch => {
        const payload = {
          date: `${matchDate} ${format(new Date(completedMatch.timestamp), 'HH:mm')}`,
          matchId: completedMatch.id,
          teamA: completedMatch.teamA.join(', '),
          teamB: completedMatch.scoreA,            // A?Ä ?êÏàòÎ•?teamB ?§Î°ú ?ÑÏÜ° (Apps Script ?§Î•ò ?∞Ìöå)
          scoreA: completedMatch.scoreB,           // B?Ä ?êÏàòÎ•?scoreA ?§Î°ú ?ÑÏÜ°
          scoreB: completedMatch.teamB.join(', '), // B?Ä Î™ÖÎã®??scoreB ?§Î°ú ?ÑÏÜ°
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
      alert('Íµ¨Í? ?úÌä∏??Î™®Îì† Í≤ΩÍ∏∞ Í≤∞Í≥º ?Ä?•Ïù¥ ?ÑÎ£å?òÏóà?µÎãà??');
    } catch (error) {
      console.error('Íµ¨Í? ?úÌä∏ ?ÑÏÜ° ?§Î•ò:', error);
      alert('Íµ¨Í? ?úÌä∏ ?Ä??Ï§??§Î•òÍ∞Ä Î∞úÏÉù?àÏäµ?àÎã§.');
    }
    setIsSyncing(false);
  };

  const resetAllData = () => {
    if(window.confirm('Î™®Îì† ?∞Ïù¥?∞Î? Ï¥àÍ∏∞?îÌïò?úÍ≤†?µÎãàÍπ?\n(?ÑÏû¨??Ï∂úÏÑù, ?§Ï?Ï§? ?êÏàò Î™®Îëê ??†ú?©Îãà??')) {
      setAttendees([]);
      setSchedule([]);
      setScheduleGenerated(false);
      setCompletedMatches([]);
      setLiveMatchId(null);
      setActiveTab('attendance');
      localStorage.clear();
    }
  };

  // Í≥µÎèô 1?ÑÍπåÏßÄ Î™®Îëê ?¨Ìï®???§Îäò??MVP Î™©Î°ù (?πÏàò ???¨Ïù∏???ôÎ•†?¥Î©¥ ?ÑÎ? ?¨Ìï®)
  const topPlayers = useMemo(() => {
    const players = Object.values(playerStats);
    if (players.length === 0) return [];
    const sorted = [...players].sort((a, b) => b.wins - a.wins || b.points - a.points);
    const best = sorted[0];
    if (!best || best.wins === 0) return [];
    return sorted.filter(p => p.wins === best.wins && p.points === best.points);
  }, [playerStats]);

  // ?¨Ïù∏????Çπ Ï∞®Ìä∏??XÏ∂ïÏóê ?¥Î¶Ñ+?¨ÏßÑ???®Íªò Í∑∏Î†§Ï£ºÎäî Ïª§Ïä§?Ä ??
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
            <Users size={18} /> Ï∂úÏÑù
          </button>
          <button className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
            <CalendarDays size={18} /> ?ÑÏ≤¥ ?ºÏ†ï
          </button>
          <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <BarChart3 size={18} /> ?Ä?úÎ≥¥??
          </button>
          <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => { setActiveTab('history'); setSelectedSession(null); }}>
            <History size={18} /> Í∏∞Î°ù
          </button>
          {liveMatchId && (
            <button className={`tab-btn ${activeTab === 'live' ? 'active' : ''}`} onClick={() => setActiveTab('live')} style={{color: '#EF4444', fontWeight: 'bold'}}>
              <Flame size={18} /> ?ºÏù¥Î∏??ùÏ†ê
            </button>
          )}
        </nav>

        {activeTab === 'attendance' && (
          <section className="tab-pane fade-in">
            <div className="card">
              <div className="card-header">
                <h2>Î©§Î≤Ñ Ï∂úÏÑù Ï≤¥ÌÅ¨</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="count-badge">{attendees.length}Î™?/span>
                  <button
                    onClick={() => { setIsMemberEditMode(v => !v); setEditingMemberIdx(null); setNewMemberName(''); }}
                    className={`member-edit-toggle ${isMemberEditMode ? 'active' : ''}`}
                    title={isMemberEditMode ? '?∏Ïßë ?ÑÎ£å' : 'Î©§Î≤Ñ ?∏Ïßë'}
                  >
                    {isMemberEditMode ? <><X size={14} /> ?ÑÎ£å</> : <><Edit2 size={14} /> ?∏Ïßë</>}
                  </button>
                </div>
              </div>

              {isMemberEditMode ? (
                <div className="member-edit-grid">
                  <div style={{ fontSize: '12px', color: '#64748B', background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '10px', padding: '8px 12px', lineHeight: 1.5 }}>
                    ?í° ?ÑÎûò?êÏÑú <b>+ ??Î©§Î≤Ñ ?¥Î¶Ñ</b>?ºÎ°ú ?†Í∑ú ?åÏõê??Ï∂îÍ??òÎ©¥ Î™©Î°ù Îß??ÑÎûò??Î∞îÎ°ú ?òÌ??òÏöî. ?¥Î¶Ñ ??<Camera size={12} style={{ verticalAlign: '-2px' }} /> Ïπ¥Î©î???ÑÏù¥ÏΩòÏùÑ ?åÎü¨ Î∞îÎ°ú ?ÑÎ°ú???¨ÏßÑ???±Î°ù/Î≥ÄÍ≤ΩÌï† ???àÏäµ?àÎã§. ?§ÎäòÎß?Ï∞∏Ïó¨?òÎäî Í≤åÏä§?∏Îäî ?ÑÎûò [Í≤åÏä§??Ï∂îÍ?]?êÏÑú ?±Î°ù??Ï£ºÏÑ∏??
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
                          <button onClick={() => saveEditMember(idx)} className="member-action-btn save" title="?Ä??><Save size={13} /></button>
                          <button onClick={() => setEditingMemberIdx(null)} className="member-action-btn cancel" title="Ï∑®ÏÜå"><X size={13} /></button>
                        </div>
                      ) : (
                        <div className="member-name-view">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MemberAvatar photo={getMemberPhoto(member)} name={member} size={34} />
                            <span className="member-name">{member}</span>
                          </div>
                          <div className="member-action-group">
                            <label className="member-action-btn photo" title="?¨ÏßÑ Î≥ÄÍ≤? style={{ cursor: 'pointer' }}>
                              <Camera size={13} />
                              <input type="file" accept="image/*" onChange={(e) => { if (e.target.files[0]) handlePhotoUpload(member, e.target.files[0]); e.target.value = ''; }} style={{ display: 'none' }} />
                            </label>
                            <button onClick={() => startEditMember(idx)} className="member-action-btn edit" title="?¥Î¶Ñ ?òÏ†ï"><Edit2 size={13} /></button>
                            <button onClick={() => deleteMember(idx)} className="member-action-btn delete" title="??†ú"><Trash2 size={13} /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* ??Î©§Î≤Ñ Ï∂îÍ? */}
                  <form onSubmit={addCoreMember} className="member-add-form">
                    <input
                      value={newMemberName}
                      onChange={e => setNewMemberName(e.target.value)}
                      placeholder="+ ??Î©§Î≤Ñ ?¥Î¶Ñ"
                      className="member-name-input"
                      maxLength={8}
                    />
                    <button type="submit" className="member-action-btn save" title="Ï∂îÍ?"><Plus size={13} /></button>
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
              <div className="card-header"><h2>Í≤åÏä§??Ï∂îÍ?</h2></div>
              <form onSubmit={addGuest} className="guest-form">
                <div className="input-group">
                  <UserPlus size={20} className="input-icon" />
                  <input type="text" placeholder="?¥Î¶Ñ ?ÖÎ†•..." value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                  <button type="submit" className="btn btn-secondary">Ï∂îÍ?</button>
                </div>
              </form>
            </div>

            <div className="card mt-4 attendance-list">
              <div className="card-header"><h2>?†Î∞ú Î™ÖÎã® ({attendees.length}Î™?</h2></div>
              <div className="chips mb-4">
                {attendees.map(a => <span key={a} className="chip" onClick={() => toggleAttendance(a)}>{a} &times;</span>)}
              </div>
              <div className="info-box mb-4">
                <p className="text-sm text-muted">???∏Ïõê?òÏóê ÎßûÎäî <b>ÏµúÏÜå Í∑†Îì± Í≤ΩÍ∏∞ ??/b>Î•?Í≥ÑÏÇ∞?òÏó¨ 100% Í≥µÌèâ???§Ï?Ï§ÑÏùÑ ?∏ÏÑ±?©Îãà?? ?ÄÍ¥Ä ?úÍ∞Ñ??ÎßûÏ∂∞ ?êÌïò???ºÏö¥?úÎ? ?†ÌÉù?òÏÑ∏??</p>
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
                      if (m > 1 && tg > 16) break; // 16Í≤ΩÍ∏∞ Ï¥àÍ≥º???ùÎûµ (?àÎ¨¥ Í∏??úÍ∞Ñ)
                      options.push(
                        <button 
                          key={m} 
                          onClick={() => generateFullSchedule(tg)} 
                          className={`btn ${m === 1 ? 'btn-primary pulse' : 'btn-secondary'} w-full`}
                          style={{ padding: '12px', fontSize: '0.95rem' }}
                        >
                          {tg}Í≤ΩÍ∏∞ ?∏ÏÑ± (1?∏Îãπ {plays}Í≤ΩÍ∏∞ Ï∞∏Ïó¨)
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
                  ??Ï¥àÍ∏∞??(Î™®Îì† ?∞Ïù¥????†ú)
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
                 <h3>?úÍ∞Ñ?úÍ? ?ÜÏäµ?àÎã§</h3>
                 <p>Ï∂úÏÑù ?îÎ©¥?êÏÑú [?úÍ∞Ñ???ùÏÑ±?òÍ∏∞]Î•??åÎü¨ ?§Ï?Ï§ÑÏùÑ ?ïÏ†ï?¥Ï£º?∏Ïöî.</p>
                 <button onClick={() => setActiveTab('attendance')} className="btn btn-secondary mt-4">Ï∂úÏÑù ?îÎ©¥?ºÎ°ú Í∞ÄÍ∏?/button>
               </div>
            ) : (
               <div className="schedule-list">
                 <div className="schedule-header card mb-4 center">
                   <h2>?§Îäò???êÎèô ?∏ÏÑ± ?úÍ∞Ñ??(Ï¥?{schedule.length}Í≤åÏûÑ)</h2>
                   <p className="text-sm text-muted">Í≤ΩÍ∏∞Î≥??êÏàòÎ•??ÖÎ†•?òÍ≥† ?Ä?•ÏùÑ ?ÑÎ•¥?∏Ïöî.</p>
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
                     <div className="match-number-badge">{match.id}Í≤ΩÍ∏∞</div>
                     
                     {/* Edit / Delete Buttons */}
                     {!match.isCompleted && !isEditing && (
                       <div className="match-actions" style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                         <button style={iconBtnStyle} onClick={() => startEditMatch(match)} title="?òÏ†ï"><Edit2 size={16} className="text-muted" /></button>
                         <button style={iconBtnStyle} onClick={() => deleteGame(match.id)} title="??†ú"><Trash2 size={16} style={{ color: '#EF4444' }} /></button>
                       </div>
                     )}
                     {/* ?ÑÎ£å??Í≤ΩÍ∏∞: Í≤∞Í≥º ?òÏ†ï / ??†ú */}
                     {match.isCompleted && (
                       <div className="match-actions" style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                         <button style={iconBtnStyle} onClick={() => reopenMatch(match.id)} title="Í≤∞Í≥º ?òÏ†ï"><Edit2 size={16} className="text-muted" /></button>
                         <button style={iconBtnStyle} onClick={() => deleteGame(match.id)} title="??†ú"><Trash2 size={16} style={{ color: '#EF4444' }} /></button>
                       </div>
                     )}
                     {isEditing && (
                       <div className="match-actions" style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
                         <button style={iconBtnStyle} onClick={() => saveEditMatch(match.id)} title="?Ä??><Save size={16} style={{ color: '#10B981' }} /></button>
                         <button style={iconBtnStyle} onClick={() => cancelEditMatch()} title="Ï∑®ÏÜå"><X size={16} className="text-muted" /></button>
                       </div>
                     )}

                     <div className="inline-match-board">
                        <div className="match-team team-a">
                          <div className="team-players" style={isEditing ? {flexDirection: 'column', gap: '4px'} : {}}>
                            {isEditing ? (
                              <>
                                <select style={selectStyle} value={editMatchData.teamA[0]} onChange={(e) => updateEditingPlayer('teamA', 0, e.target.value)}>
                                  <option value="">?†ÌÉù</option>
                                  {attendees.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                                <select style={selectStyle} value={editMatchData.teamA[1]} onChange={(e) => updateEditingPlayer('teamA', 1, e.target.value)}>
                                  <option value="">?†ÌÉù</option>
                                  {attendees.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                              </>
                            ) : match.teamA.map(name => (
                              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '6px', ...(aWon ? { fontWeight: '900', color: '#10B981' } : {}) }}>
                                <MemberAvatar photo={getMemberPhoto(name)} name={name} size={26} />
                                <span>{aWon && '?èÜ '}{name}</span>
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
                                  <option value="">?†ÌÉù</option>
                                  {attendees.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                                <select style={selectStyle} value={editMatchData.teamB[1]} onChange={(e) => updateEditingPlayer('teamB', 1, e.target.value)}>
                                  <option value="">?†ÌÉù</option>
                                  {attendees.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                              </>
                            ) : match.teamB.map(name => (
                              <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', ...(bWon ? { fontWeight: '900', color: '#10B981' } : {}) }}>
                                <span>{name}{bWon && ' ?èÜ'}</span>
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
                           <Flame size={14} style={{marginRight: '4px', color: '#EF4444'}}/> ?ºÏù¥Î∏??êÏàò??
                         </button>
                         <button onClick={() => saveMatchResult(match)} disabled={isEditing} className="btn btn-primary sm">
                           Í≤∞Í≥º Î°úÏª¨ ?Ä??
                         </button>
                       </div>
                     ) : (
                        match.scoreA === match.scoreB && !match.hasTiebreak
  ? <div className="match-footer mt-4 center" style={{color:'#F59E0B'}}><CheckCircle2 size={16} /> Î¨¥ÏäπÎ∂Ä! {match.scoreA} : {match.scoreB} - ?§Îäò?Ä ?ôÎ•†! ?§ù</div>
  : <div className="match-footer mt-4 center text-success" style={{fontWeight:'800',fontSize:'1.05rem'}}>
      <Trophy size={17} style={{marginRight:'4px'}} />
      {match.hasTiebreak
        ? (match.tiebreakA > match.tiebreakB ? match.teamA.join('+') : match.teamB.join('+'))
        : (match.scoreA > match.scoreB ? match.teamA.join('+') : match.teamB.join('+'))
      } ?πÎ¶¨! ({match.scoreA}:{match.scoreB}{match.hasTiebreak ? ` TB ${match.tiebreakA}:${match.tiebreakB}` : ''})
    </div>
                     )}
                   </div>
                 )})}
                 
                 <div className="add-match-container mt-6 center" style={{ marginTop: '24px', textAlign: 'center' }}>
                   <button className="btn btn-secondary" onClick={addGame} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}>
                     <Plus size={18} /> ??Í≤åÏûÑ Ï∂îÍ??òÍ∏∞
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
                  ?§Îäò???åÎãà????topPlayers.length > 1 ? 'S' : ''}
                  {topPlayers.length > 1 && (
                    <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.25)', padding: '2px 8px', borderRadius: '99px', marginLeft: '4px' }}>
                      Í≥µÎèô {topPlayers.length}Î™?
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
                        <span className="mvp-stat">{tp.wins}??{tp.losses}??{tp.draws || 0}Î¨?/ {tp.points}pts ?ëë</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="stats-header-grid mt-4">
              <div className="card stat-mini" style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '130px' }}>
                <span className="stat-label">ÏßÑÌñâ Í≤åÏûÑ</span>
                <span className="stat-val">{completedMatches.length} <small>/ {schedule.length || 0}</small></span>
                <button onClick={syncToGoogleSheets} disabled={isSyncing} className="btn btn-primary" style={{ padding: '8px', fontSize: '14px', width: '100%', marginTop: 'auto' }}>
                   {isSyncing ? '?Ä??Ï§?..' : 'Íµ¨Í? ?úÌä∏ ?ºÍ¥Ñ ?ÑÏÜ°'}
                </button>
                <button onClick={resetAllData} className="btn btn-secondary" style={{ padding: '8px', fontSize: '14px', width: '100%', borderColor: '#EF4444', color: '#EF4444' }}>
                   ??Ï¥àÍ∏∞??
                </button>
              </div>
              <div className="card stat-mini">
                <span className="stat-label">Ï¥??çÎìù ?¨Ïù∏??/span>
                <span className="stat-val">{Object.values(playerStats).reduce((acc, p) => acc + p.points, 0)} pts</span>
              </div>
            </div>

            {/* Charts Section */}
            <div className="card mt-4 chart-card">
              <div className="card-header">
                <h2>?§ÏãúÍ∞??¨Ïù∏????Çπ (Top 5)</h2>
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
                  <h2>?ùÏã§Ï∞???Çπ</h2>
                  <BarChart3 size={20} className="text-primary" />
                </div>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '-6px 0 8px', lineHeight: 1.5 }}>
                  ?çÎìù Í≤åÏûÑ?êÏÑú ?ÉÏ? Í≤åÏûÑ??Î∫Ä Í∞íÏûÖ?àÎã§. ?ëÏ†ÑÎ≥¥Îã§ Í≤ΩÍ∏∞ ?êÎ¶Ñ??????Î≥¥Ïó¨Ï§çÎãà??
                </p>
                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <BarChart data={pointDiffData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value > 0 ? '+' : ''}${value}`, '?ùÏã§Ï∞?]} />
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
                <div className="card-header"><h2>Í≤ΩÍ∏∞ ?ÅÌñ•????Çπ</h2></div>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '-6px 0 8px', lineHeight: 1.5 }}>
                  ?πÏ†ê(??3?? Î¨?1??, ?ùÏã§Ï∞? Ï∞∏Ïó¨ Í≤ΩÍ∏∞ ?òÎ? ?®Íªò Î∞òÏòÅ??Ï¢ÖÌï© ÏßÄ?úÏûÖ?àÎã§.
                </p>
                <div className="table-container">
                  <table className="stats-table">
                    <thead>
                      <tr><th>?¥Î¶Ñ</th><th>?πÏ†ê</th><th>?ùÏã§Ï∞?/th><th>?πÎ•†</th><th>?ÅÌñ•??/th></tr>
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
                <div className="card-header"><h2>?πÌå® Î∂ÑÌè¨</h2></div>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '-6px 0 8px', lineHeight: 1.5 }}>
                  ?§Îäò Î™®Îì† Ï∞∏Í??êÏùò Í≤ΩÍ∏∞ Í≤∞Í≥ºÎ•??©ÏÇ∞??ÎπÑÏú®?¥Ïóê?? ??Í≤åÏûÑÎßàÎã§ ?πÏûê 2Î™Ö¬∑Ìå®??2Î™ÖÏù¥ ?òÏò§?? <b>?πÎ¶¨</b>?Ä <b>?®Î∞∞</b> ?©Í≥Ñ????ÉÅ Í∞ôÍ≥† <b>Î¨¥ÏäπÎ∂Ä</b>??ÎπÑÍ∏¥ Í≤åÏûÑ??Ï∞∏Ïó¨???∏Ïõê?òÏòà??
                </p>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={winDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name">
                        {winDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : index === 1 ? '#F59E0B' : '#EF4444'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value}??, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '4px', fontSize: '12px', fontWeight: '700' }}>
                  {winDistribution.map((d, i) => (
                    <span key={d.name} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#475569' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '3px', display: 'inline-block', background: i === 0 ? '#10B981' : i === 1 ? '#F59E0B' : '#EF4444' }} />
                      {d.name} {d.value}??
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ?§Îäò???ÑÏ≤¥ Í≤ΩÍ∏∞ Í≤∞Í≥º */}
            {participationBalance.length > 0 && (
              <div className="card mt-4">
                <div className="card-header"><h2>Ï∞∏Ïó¨ Í∑†Ìòï??/h2></div>
                <p style={{ fontSize: '12px', color: '#94A3B8', margin: '-6px 0 8px', lineHeight: 1.5 }}>
                  ?§Îäò Ï∞∏Í??êÎì§???ºÎßà??Í≥†Î•¥Í≤?Í≤ΩÍ∏∞??Ï∞∏Ïó¨?àÎäîÏßÄ Î≥¥Ïó¨Ï§çÎãà??
                </p>
                <div className="table-container">
                  <table className="stats-table">
                    <thead><tr><th>?¥Î¶Ñ</th><th>Ï∞∏Ïó¨ Í≤ΩÍ∏∞</th><th>?âÍ∑† ?ÄÎπ?/th></tr></thead>
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
                <div className="card-header"><h2>?§Îäò???ëÏ†Ñ Í≤ΩÍ∏∞</h2></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {closeMatches.slice(0, 5).map(match => (
                    <div key={match.id} style={{ padding: '10px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748B' }}>{match.id}Í≤ΩÍ∏∞</div>
                      <div style={{ fontWeight: '800', lineHeight: 1.45 }}>
                        {(match.teamA || []).join(' & ')} {match.scoreA}:{match.scoreB} {(match.teamB || []).join(' & ')}
                      </div>
                      <div style={{ fontSize: '12px', color: '#F59E0B', marginTop: '3px', fontWeight: 700 }}>
                        {match.hasTiebreak
                          ? `?Ä?¥Î∏å?àÏù¥??${match.tiebreakA}:${match.tiebreakB}`
                          : match.scoreA === match.scoreB
                            ? 'Î¨¥ÏäπÎ∂Ä Í≤ΩÍ∏∞'
                            : `?êÏàò Ï∞?${match.margin}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completedMatches.length > 0 && (
              <div className="card mt-4">
                <div className="card-header"><h2>?éæ ?§Îäò???ÑÏ≤¥ Í≤ΩÍ∏∞ Í≤∞Í≥º</h2></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[...completedMatches].sort((a, b) => a.id - b.id).map(m => {
                    const aWon = m.hasTiebreak ? m.tiebreakA > m.tiebreakB : m.scoreA > m.scoreB;
                    const bWon = m.hasTiebreak ? m.tiebreakB > m.tiebreakA : m.scoreB > m.scoreA;
                    const isDraw = !aWon && !bWon;
                    const sideStyle = (won) => ({ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: won ? '900' : '600', color: won ? '#10B981' : '#0F172A' });
                    return (
                      <div key={m.id} style={{ background: '#F8FAFC', border: '1.5px solid #F1F5F9', borderRadius: '14px', padding: '12px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '8px' }}>
                          {m.id}Í≤ΩÍ∏∞{isDraw ? ' ¬∑ Î¨¥ÏäπÎ∂Ä ?§ù' : ''}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                            {m.teamA.map(name => (
                              <div key={name} style={sideStyle(aWon)}>
                                <MemberAvatar photo={getMemberPhoto(name)} name={name} size={28} />
                                <span>{aWon && '?èÜ '}{name}</span>
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
                                <span>{name}{bWon && ' ?èÜ'}</span>
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
              <div className="card-header"><h2>Í∞úÏù∏Î≥??§Îäò ?úÎèô ?¥Ïó≠</h2></div>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '-6px 0 8px' }}>?¨Ïù∏???çÎìù ?êÏàò) Í∏∞Ï??ºÎ°ú ?¥Î¶ºÏ∞®Ïàú ?ïÎ†¨?àÏñ¥??</p>
              <div className="table-container">
                <table className="stats-table">
                  <thead><tr><th>?¥Î¶Ñ</th><th>Ï∞∏Ïó¨</th><th>??Î¨???/th><th>?πÎ•†</th><th>?êÏàò</th></tr></thead>
                  <tbody>
                    {[...new Set(completedMatches.flatMap(m => [...(m.teamA||[]), ...(m.teamB||[])]))]
                      .map(a => ({ name: a, st: playerStats[a] || { games: 0, wins: 0, losses: 0, draws: 0, points: 0 } }))
                      .sort((x, y) => y.st.points - x.st.points)
                      .map(({ name: a, st }) => (
                        <tr key={a}>
                          <td className="font-bold">{a}</td>
                          <td translate="no">{st.games}</td>
                          <td translate="no">
                            <span className="text-success">{st.wins}??/span>{' '}
                            <span style={{color:'#F59E0B'}}>{st.draws||0}Î¨?/span>{' '}
                            <span style={{color:'#EF4444'}}>{st.losses}??/span>
                          </td>
                          <td translate="no">{st.games>0?Math.round(st.wins/st.games*100):0}%</td>
                          <td translate="no">{st.points}pts</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          {/* ?åÌä∏??Í∂ÅÌï© Î∂ÑÏÑù */}
          {partnerStats.length > 0 && (
            <div className="card mt-4">
              <div className="card-header"><h2>?§ù ?§Îäò??Î≤†Ïä§???åÌä∏??Ï°∞Ìï©</h2></div>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '-6px 0 8px' }}>?πÎ•† 70% ?¥ÏÉÅ(2Í≤åÏûÑ ?¥ÏÉÅ)??Ï°∞Ìï©?Ä <b style={{color:'#D97706'}}>?î• Í≥†ÏäπÎ•??Ä??/b>Î°?Í∞ïÏ°∞?àÏñ¥??</p>
              <table className="stats-table">
                <thead><tr><th>?åÌä∏??Ï°∞Ìï©</th><th>Í≤åÏûÑ</th><th>??/th><th>Î¨?/th><th>?πÎ•†</th></tr></thead>
                <tbody>
                  {partnerStats.map((p,i) => {
                    const winRate = p.games > 0 ? Math.round(p.wins / p.games * 100) : 0;
                    const isHot = p.games >= 2 && winRate >= 70;
                    return (
                      <tr key={p.players.join('|')} style={isHot ? { background: '#FFFBEB' } : {}}>
                        <td className="font-bold">
                          {i===0?'?•á':i===1?'?•à':i===2?'?•â':'  '} {p.players.join(' & ')}
                          {isHot && <span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: '800', background: '#F59E0B', color: 'white', padding: '2px 7px', borderRadius: '99px' }}>?î• Í≥†ÏäπÎ•??Ä??/span>}
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

          {/* ?¨Î??àÎäî Í∞úÏù∏ ÏΩîÎ©ò??*/}
          {partnerMatrix.length > 0 && (
            <div className="card mt-4">
              <div className="card-header"><h2>?åÌä∏??Í∂ÅÌï© Î∂ÑÏÑù</h2></div>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '-6px 0 8px', lineHeight: 1.5 }}>
                ?®Íªò ??Ï°∞Ìï©???πÎ•†Í≥??ùÏã§Ï∞®Î? Í∞ôÏù¥ Î≥¥Ïó¨Ï§çÎãà??
              </p>
              <div className="table-container">
                <table className="stats-table">
                  <thead><tr><th>Ï°∞Ìï©</th><th>Í≤ΩÍ∏∞</th><th>?πÎ•†</th><th>?ùÏã§Ï∞?/th></tr></thead>
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
              <div className="card-header"><h2>?ÅÎ? Ï°∞Ìï© Î∂ÑÏÑù</h2></div>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: '-6px 0 8px', lineHeight: 1.5 }}>
                ?¥Îñ§ Ï°∞Ìï©???¥Îñ§ Ï°∞Ìï©???ÅÎ?Î°?Í∞ïÌñà?îÏ? Î≥¥Ïó¨Ï§çÎãà??
              </p>
              <div className="table-container">
                <table className="stats-table">
                  <thead><tr><th>Îß§Ïπò??/th><th>Í≤ΩÍ∏∞</th><th>Í≤∞Í≥º</th><th>?ùÏã§Ï∞?/th></tr></thead>
                  <tbody>
                    {matchupStats.slice(0, 6).map(row => (
                      <tr key={row.matchup}>
                        <td className="font-bold">{row.matchup}</td>
                        <td>{row.games}</td>
                        <td>{row.teamAWins}??/ {row.draws}Î¨?/ {row.teamBWins}??/td>
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
              <div className="card-header"><h2>?òÑ ?§Îäò??TMI ÏΩîÎ©ò??/h2></div>
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

          {/* ?¥Î≥¥?¥Í∏∞ + Í∏∞Î°ù ?Ä??Î≤ÑÌäº */}
          <div className="card mt-4" style={{textAlign:'center'}}>
            <div className="card-header"><h2>?ì§ Í≤ΩÍ∏∞ Í≤∞Í≥º Í≥µÏú†?òÍ∏∞</h2></div>
            <p style={{fontSize:'13px',color:'#64748b',marginBottom:'12px'}}>HTML ?åÏùºÎ°??Ä????Ïπ¥Ïπ¥?§ÌÜ°??Í≥µÏú†?òÏÑ∏??</p>
            <button onClick={exportDashboard} className="btn btn-primary" style={{width:'100%',padding:'14px',fontSize:'15px',background:'linear-gradient(135deg,#4F46E5,#7C3AED)'}}>
              ?ì• Í≤ΩÍ∏∞ Í≤∞Í≥º HTML ?§Ïö¥Î°úÎìú
            </button>
            <button onClick={saveSession} className="btn btn-secondary mt-3" style={{width:'100%',padding:'12px',fontSize:'14px'}}>
              ?íæ Í∏∞Î°ù ??óê ?†ÏßúÎ≥ÑÎ°ú ?Ä??
            </button>
          </div>
          </section>
        )}

        {activeTab === 'history' && (
          <section className="section">
            {selectedSession ? (
              <div>
                <button onClick={() => setSelectedSession(null)} className="btn btn-secondary" style={{marginBottom:'16px'}}>
                  ??Î™©Î°ù?ºÎ°ú
                </button>
                <div className="card">
                  <div className="card-header">
                    <h2>?ìÖ {selectedSession.session_date} Í≤ΩÍ∏∞ Í∏∞Î°ù</h2>
                    <span style={{fontSize:'13px',color:'#64748b'}}>Ï∞∏ÏÑù {(selectedSession.attendees||[]).length}Î™?¬∑ {(selectedSession.matches||[]).filter(m=>m.isCompleted).length}Í≤ΩÍ∏∞ ?ÑÎ£å</span>
                  </div>
                  <table className="stats-table" style={{marginTop:'12px'}}>
                    <thead><tr><th>?¥Î¶Ñ</th><th>Ï∞∏Ïó¨</th><th>??Î¨???/th><th>?πÎ•†</th><th>?êÏàò</th></tr></thead>
                    <tbody>
                      {Object.values(selectedSession.stats||{}).sort((a,b)=>b.points-a.points).map(st => (
                        <tr key={st.name}>
                          <td className="font-bold">{st.name}</td>
                          <td>{st.games}</td>
                          <td><span className="text-success">{st.wins}??/span> <span style={{color:'#F59E0B'}}>{st.draws||0}Î¨?/span> <span style={{color:'#EF4444'}}>{st.losses}??/span></td>
                          <td>{st.games>0?Math.round(st.wins/st.games*100):0}%</td>
                          <td>{st.points}pts</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="card mt-4">
                  <div className="card-header"><h2>?éæ Í≤ΩÍ∏∞ Í≤∞Í≥º</h2></div>
                  {(selectedSession.matches||[]).filter(m=>m.isCompleted).map(m => (
                    <div key={m.id} style={{padding:'10px 0',borderBottom:'1px solid #F1F5F9',display:'flex',alignItems:'center',gap:'8px',fontSize:'14px'}}>
                      <span style={{minWidth:'50px',color:'#64748b'}}>{m.id}Í≤ΩÍ∏∞</span>
                      <span style={{flex:1,textAlign:'right'}}>{(m.teamA||[]).join(' & ')}</span>
                      <span style={{fontWeight:'900',fontSize:'18px',padding:'0 8px'}}>{m.scoreA}:{m.scoreB}</span>
                      <span style={{flex:1}}>{(m.teamB||[]).join(' & ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="card-header" style={{marginBottom:'12px'}}><h2>?ìã ?†ÏßúÎ≥?Í≤ΩÍ∏∞ Í∏∞Î°ù</h2></div>
                {sessions.length === 0 ? (
                  <div className="card" style={{textAlign:'center',padding:'40px',color:'#94A3B8'}}>
                    <p style={{fontSize:'32px',marginBottom:'8px'}}>?ìÇ</p>
                    <p>?Ä?•Îêú Í∏∞Î°ù???ÜÏäµ?àÎã§.</p>
                    <p style={{fontSize:'13px',marginTop:'8px'}}>?Ä?úÎ≥¥???òÎã®??"Í∏∞Î°ù ??óê ?†ÏßúÎ≥ÑÎ°ú ?Ä?? Î≤ÑÌäº???ÑÎ•¥Î©??¥Í≥≥???ìÏûÖ?àÎã§.</p>
                  </div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                    {sessions.map(s => (
                      <div key={s.id} onClick={() => setSelectedSession(s)}
                        className="card" style={{cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px'}}>
                        <div>
                          <div style={{fontWeight:'800',fontSize:'15px'}}>{s.session_date}</div>
                          <div style={{fontSize:'13px',color:'#64748b',marginTop:'2px'}}>
                            Ï∞∏ÏÑù {(s.attendees||[]).length}Î™?¬∑ {(s.matches||[]).filter(m=>m.isCompleted).length}Í≤ΩÍ∏∞
                          </div>
                        </div>
                        <span style={{color:'#94A3B8',fontSize:'20px'}}>??/span>
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
          
          // ?Ä?¥Î∏å?àÏù¥??Í∞Ä???¨Î?: Í≤åÏûÑ??5:5 ?êÎäî 6:6 ?¥ÏÉÅ ?ôÏ†ê
          const canStartTiebreak = !isTiebreak && match.scoreA === match.scoreB && match.scoreA >= 5;

          return (
            <section className="tab-pane fade-in">
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px' }}>
                  {match.id}Í≤ΩÍ∏∞ ?ºÏù¥Î∏??êÏàò??
                  {isTiebreak && <span style={{fontSize:'14px',background:'#FEF3C7',color:'#D97706',padding:'2px 10px',borderRadius:'99px',marginLeft:'8px',fontWeight:'800'}}>?èÜ TIEBREAK</span>}
                </h2>
                <p className="text-sm text-muted">
                  {isTiebreak ? '?Ä?¥Î∏å?àÏù¥?? 1?êÏî© ?¨ÎùºÍ∞ëÎãà??' : '?åÎãà??Î£?0, 15, 30, 40, AD)???ÅÏö©?òÏóà?µÎãà??'}
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
                  <span style={{ color: '#c084fc' }}>??/span> PASSING <span style={{ color: '#c084fc' }}>??/span>
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

                {/* Tiebreak ?úÏûë / Ï∑®ÏÜå Î≤ÑÌäº */}
                <div style={{ marginTop: '16px', padding: '0 10px' }}>
                  {canStartTiebreak && (
                    <button
                      onClick={startTiebreak}
                      style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)', color:'white', border:'none', borderRadius:'8px', padding:'10px 24px', fontWeight:'800', fontSize:'14px', cursor:'pointer', width:'100%', letterSpacing:'0.5px' }}
                    >
                      ?èÜ ?Ä?¥Î∏å?àÏù¥???úÏûë ({match.scoreA}:{match.scoreB})
                    </button>
                  )}
                  {isTiebreak && (
                    <div style={{display:'flex', gap:'8px', marginTop: canStartTiebreak ? '8px' : '0'}}>
                      <div style={{flex:1, background:'#FEF3C7', borderRadius:'8px', padding:'10px', textAlign:'center', fontWeight:'800', fontSize:'15px', color:'#92400e'}}>
                        TB: <span style={{color:'#1a1a1a', fontSize:'18px'}}>{tiebreakPoints.A}</span> : <span style={{color:'#16a34a', fontSize:'18px'}}>{tiebreakPoints.B}</span>
                      </div>
                      <button onClick={cancelTiebreak} style={{background:'#FEE2E2',color:'#DC2626',border:'none',borderRadius:'8px',padding:'10px 14px',fontWeight:'700',fontSize:'13px',cursor:'pointer', flexShrink:0}}>Ï∑®ÏÜå</button>
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
                    ?èÜ ?Ä?¥Î∏å?àÏù¥??ÏßÑÌñâ Ï§?¬∑ {match.scoreA}:{match.scoreB} (TB {tiebreakPoints.A}:{tiebreakPoints.B})
                  </div>
                )}
                <button onClick={() => saveMatchResult(match)} className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px' }}>
                  Í≤ΩÍ∏∞ Ï¢ÖÎ£å Î∞?Í≤∞Í≥º ?Ä??
                </button>
                <button onClick={() => setActiveTab('schedule')} className="btn btn-secondary mt-3" style={{ width: '100%', padding: '12px' }}>
                  ?ºÏ†ï?ºÎ°ú ?åÏïÑÍ∞ÄÍ∏?
                </button>
              </div>
            </section>
          );
        })()}
      </main>
    </div>
  );
}
