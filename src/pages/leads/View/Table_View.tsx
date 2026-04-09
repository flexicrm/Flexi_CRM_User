import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, BellRing, CheckCircle, Clock, PlusCircle, VolumeX, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

import Generating_new_leads from "../../../assets/image/Generating_new_leads.gif";
import Table, { type Column } from "../../../component/table/Table";
import TableNotFound from "../../../component/TableNotFound/TableNotFound";

import ding_sound_246413 from "../../../assets/image/ding_sound_246413.mp3";
import AddFollowUp_Model from "../AddFaloowUp_Model";
import Convert_custommer_Model from "../Convert_custommer_Model";

interface TableViewProps {
  data: any[];
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
}

interface FollowUpReminder {
  id: string;
  baseId: string;
  leadId: string;
  leadName: string;
  followUpDate: string;
  alarmTime: string;
  followUpNote: string;
  priority: string;
  status: string;
  statusId?: string;
  isNotified: boolean;
  notifiedAt?: string;
  stageLabel: string;
  stageSuffix: string;
}

interface AlarmState {
  reminderId: string;
  scheduledTime: Date;
  ringInterval: ReturnType<typeof setInterval> | null;
  stopTimeout: ReturnType<typeof setTimeout> | null;
  isRinging: boolean;
  messageShown: boolean;
  currentAudio: HTMLAudioElement | null;
}

const Table_View = ({ data, setSelectedIds }: TableViewProps) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [notifications, setNotifications] = useState<FollowUpReminder[]>([]);
  const [activeAlarms, setActiveAlarms] = useState<Map<string, FollowUpReminder>>(new Map());
  const [isMuted, setIsMuted] = useState(false);
  
  const [alarmTimers, setAlarmTimers] = useState<Map<string, AlarmState>>(new Map());
  
  // Track dismissed alarms permanently (until page refresh)
  const [dismissedAlarms, setDismissedAlarms] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('dismissed_alarms_v7');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const notificationRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const alertDialogRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const selectedLeadId = searchParams.get("LeadId");
  const selectedLeadData = data.find(lead => lead.LeadId === selectedLeadId);
  const { permissions } = useSelector((state: any) => state.auth);
  const Roles = permissions?.[1];

  // Save dismissed alarms to localStorage
  useEffect(() => {
    localStorage.setItem('dismissed_alarms_v7', JSON.stringify(Array.from(dismissedAlarms)));
  }, [dismissedAlarms]);

  // Load saved notifications
  useEffect(() => {
    const savedNotifications = localStorage.getItem('followUpNotifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        const now = new Date();
        const validNotifications = parsed.filter((n: FollowUpReminder) => {
          const dueDate = new Date(n.followUpDate);
          return dueDate > new Date(now.getTime() - 86400000);
        });
        setNotifications(validNotifications);
      } catch (e) {
        console.error('Failed to load notifications:', e);
      }
    }
  }, []);

  useEffect(() => {
    const now = new Date();
    const validNotifications = notifications.filter(n => {
      const dueDate = new Date(n.followUpDate);
      return dueDate > new Date(now.getTime() - 86400000);
    });
    if (validNotifications.length !== notifications.length) {
      setNotifications(validNotifications);
    } else {
      localStorage.setItem('followUpNotifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      // Clean up all alarms
      alarmTimers.forEach((alarmState, reminderId) => {
        if (alarmState.ringInterval) clearInterval(alarmState.ringInterval);
        if (alarmState.stopTimeout) clearTimeout(alarmState.stopTimeout);
        if (alarmState.currentAudio) {
          alarmState.currentAudio.pause();
          alarmState.currentAudio.currentTime = 0;
        }
      });
      
      alertDialogRefs.current.forEach((alertDiv) => {
        if (alertDiv && alertDiv.parentNode) alertDiv.remove();
      });
      alertDialogRefs.current.clear();
    };
  }, []);

  // Check every 5 seconds
  useEffect(() => {
    checkAndTriggerAlarms();
    intervalRef.current = setInterval(checkAndTriggerAlarms, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [data, dismissedAlarms]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotificationPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (Notification.permission === 'default') Notification.requestPermission();
  }, []);

  const getAlarmSoundConfig = (stageSuffix: string) => {
    return { url: ding_sound_246413, volume: 1.0 };
  };

  // Complete stop of an alarm - removes ringing completely
  const stopAlarmCompletely = (reminderId: string, isPermanent: boolean = false) => {
    console.log(`🛑 Stopping alarm completely: ${reminderId}, permanent: ${isPermanent}`);
    
    // Get the alarm state
    const alarmState = alarmTimers.get(reminderId);
    if (alarmState) {
      // Stop the ring interval
      if (alarmState.ringInterval) {
        clearInterval(alarmState.ringInterval);
        console.log(`✅ Cleared ring interval for: ${reminderId}`);
      }
      // Stop the auto-stop timeout
      if (alarmState.stopTimeout) {
        clearTimeout(alarmState.stopTimeout);
        console.log(`✅ Cleared stop timeout for: ${reminderId}`);
      }
      // Stop the current audio
      if (alarmState.currentAudio) {
        alarmState.currentAudio.pause();
        alarmState.currentAudio.currentTime = 0;
        console.log(`✅ Stopped audio for: ${reminderId}`);
      }
    }
    
    // Remove alert dialog
    const alertDiv = alertDialogRefs.current.get(reminderId);
    if (alertDiv && alertDiv.parentNode) {
      alertDiv.remove();
      alertDialogRefs.current.delete(reminderId);
      console.log(`✅ Removed alert dialog for: ${reminderId}`);
    }
    
    // Remove from alarm timers
    setAlarmTimers(prev => {
      const newMap = new Map(prev);
      newMap.delete(reminderId);
      return newMap;
    });
    
    // Remove from active alarms
    setActiveAlarms(prev => {
      const newMap = new Map(prev);
      newMap.delete(reminderId);
      return newMap;
    });
    
    // If permanent dismissal, add to dismissed set
    if (isPermanent) {
      setDismissedAlarms(prev => {
        const newSet = new Set(prev);
        newSet.add(reminderId);
        console.log(`✅ Added to permanent dismissals: ${reminderId}`);
        return newSet;
      });
    }
  };

  const playSound = (reminderId: string, stageSuffix: string, currentAlarmState: AlarmState) => {
    if (isMuted) return;
    
    // Don't play if permanently dismissed
    if (dismissedAlarms.has(reminderId)) {
      console.log(`🔇 Skipping sound for permanently dismissed alarm: ${reminderId}`);
      return false;
    }
    
    const config = getAlarmSoundConfig(stageSuffix);
    const audio = new Audio(config.url);
    audio.volume = config.volume;
    
    // Store audio in alarm state
    currentAlarmState.currentAudio = audio;
    
    // Play and handle errors
    audio.play().catch(e => {
      console.warn("Browser blocked audio playback:", e);
    });
    
    console.log(`🔊 Playing sound for: ${reminderId}`);
    return true;
  };

  const startRinging = (reminderId: string, reminder: FollowUpReminder) => {
    // Check if already ringing
    if (alarmTimers.has(reminderId)) {
      console.log(`⚠️ Alarm already ringing for: ${reminderId}`);
      return;
    }
    
    // Check if permanently dismissed
    if (dismissedAlarms.has(reminderId)) {
      console.log(`🚫 Alarm permanently dismissed, not ringing: ${reminderId}`);
      return;
    }
    
    console.log(`🔔 STARTING RINGING for: ${reminder.stageLabel} - ${reminder.leadName}`);
    
    // Create alarm state
    const alarmState: AlarmState = {
      reminderId,
      scheduledTime: new Date(reminder.alarmTime),
      ringInterval: null,
      stopTimeout: null,
      isRinging: true,
      messageShown: false,
      currentAudio: null
    };
    
    // Play sound immediately
    playSound(reminderId, reminder.stageSuffix, alarmState);
    
    // Set up ring interval
    alarmState.ringInterval = setInterval(() => {
      // Check if dismissed before playing sound
      if (dismissedAlarms.has(reminderId)) {
        console.log(`🚫 Alarm permanently dismissed during ringing, stopping: ${reminderId}`);
        stopAlarmCompletely(reminderId, false);
        return;
      }
      
      // Check if alarm still exists
      if (!alarmTimers.has(reminderId)) {
        console.log(`⚠️ Alarm no longer exists, stopping ring: ${reminderId}`);
        if (alarmState.ringInterval) clearInterval(alarmState.ringInterval);
        return;
      }
      
      playSound(reminderId, reminder.stageSuffix, alarmState);
    }, 15000);
    
    // Auto-stop after 2 minutes
    alarmState.stopTimeout = setTimeout(() => {
      console.log(`⏹️ Auto-stopping ringing for: ${reminder.stageLabel}`);
      stopAlarmCompletely(reminderId, false);
    }, 120000);
    
    // Store alarm state
    setAlarmTimers(prev => new Map(prev).set(reminderId, alarmState));
    setActiveAlarms(prev => new Map(prev).set(reminderId, reminder));
    
    // Show browser notification
    if (Notification.permission === 'granted' && !dismissedAlarms.has(reminderId)) {
      new Notification(`🔔 ${reminder.stageLabel}: ${reminder.leadName}`, {
        body: `📅 Scheduled: ${new Date(reminder.followUpDate).toLocaleString()}\n📝 ${reminder.followUpNote}`,
        icon: '/favicon.ico',
        tag: reminderId,
        requireInteraction: reminder.stageSuffix === 'exact'
      });
    }
    
    // Show alert dialog
    showAlertDialog(reminder, reminderId);
  };

  const checkAndTriggerAlarms = () => {
    const now = new Date();
    const nowTime = now.getTime();
    
    // Stages configuration
    const alarmStages = [
      { offset: 10 * 60 * 1000, suffix: '10m', label: '10 Minutes Before' },
      { offset: 5 * 60 * 1000, suffix: '5m', label: '5 Minutes Before' },
      { offset: 0, suffix: 'exact', label: 'Time Now' }
    ];

    data.forEach(lead => {
      const followUps = lead.followUps || [];
      
      followUps.forEach((followUp: any, index: number) => {
        let targetAlarmTime = followUp.reminderDateTime || followUp.dateTime || followUp.dueDate;
        if (!targetAlarmTime || !followUp.isSetTimer) return;
        
        let dueDate: Date;
        try {
          dueDate = new Date(targetAlarmTime);
          if (isNaN(dueDate.getTime())) return;
        } catch (e) { return; }
        
        const baseReminderId = `${lead.LeadId}_${followUp._id || index}_${dueDate.getTime()}`;
        
        alarmStages.forEach(stage => {
          const stageId = `${baseReminderId}_${stage.suffix}`;
          const alarmTime = new Date(dueDate.getTime() - stage.offset);
          const timeUntilAlarm = alarmTime.getTime() - nowTime;
          
          // Check if already ringing or dismissed
          if (alarmTimers.has(stageId)) return;
          if (dismissedAlarms.has(stageId)) return;
          
          // Check if alarm time has been reached or passed (within 5 seconds window)
          const shouldTrigger = timeUntilAlarm <= 5000 && timeUntilAlarm >= -5000;
          
          if (shouldTrigger) {
            console.log(`✅ TRIGGERING ${stage.suffix} alarm for ${lead.manualData?.name}`);
            
            const alarmData: FollowUpReminder = {
              id: stageId,
              baseId: baseReminderId,
              leadId: lead.LeadId,
              leadName: lead.manualData?.name || 'Unknown Lead',
              followUpDate: targetAlarmTime,
              alarmTime: alarmTime.toISOString(),
              followUpNote: followUp.notes || followUp.note || 'No notes',
              priority: followUp.priority || 'medium',
              status: followUp.status,
              statusId: typeof followUp.status === 'object' ? followUp.status._id : followUp.status,
              isNotified: false,
              stageLabel: stage.label,
              stageSuffix: stage.suffix
            };
            
            startRinging(stageId, alarmData);
            
            // Add to notifications for exact time
            if (stage.suffix === 'exact') {
              setNotifications(prev => {
                const exists = prev.find(n => n.baseId === baseReminderId);
                if (!exists) {
                  return [...prev, alarmData];
                }
                return prev;
              });
            }
          }
        });
      });
    });
  };

  const showAlertDialog = (reminder: FollowUpReminder, reminderId: string) => {
    // Remove existing alert dialog for this reminder
    const existingAlert = alertDialogRefs.current.get(reminderId);
    if (existingAlert && existingAlert.parentNode) {
      existingAlert.remove();
      alertDialogRefs.current.delete(reminderId);
    }
    
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed top-4 right-4 z-[10000] animate-slide-in';
    alertDiv.id = `alert-${reminderId}`;
    
    let colorClass = '';
    if (reminder.stageSuffix === 'exact') {
      colorClass = 'bg-red-500 border-red-600';
    } else if (reminder.stageSuffix === '5m') {
      colorClass = 'bg-orange-500 border-orange-600';
    } else {
      colorClass = 'bg-yellow-500 border-yellow-600';
    }
    
    alertDiv.innerHTML = `
      <div class="${colorClass} text-white rounded-2xl shadow-2xl p-6 max-w-md border-2 relative">
        <div class="flex items-center gap-3 mb-3">
          <div class="animate-pulse text-2xl">🔔</div>
          <h3 class="font-bold text-lg">${reminder.stageLabel.toUpperCase()}!</h3>
        </div>
        <p class="text-sm mb-2"><strong>Lead:</strong> ${reminder.leadName}</p>
        <p class="text-sm mb-2"><strong>Scheduled For:</strong> ${new Date(reminder.followUpDate).toLocaleString()}</p>
        <p class="text-sm mb-4"><strong>Note:</strong> ${reminder.followUpNote}</p>
        <div class="flex gap-2">
          <button onclick="window.stopCurrentAlarm('${reminderId}')" class="bg-white text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-sm text-sm">
            🔕 Stop Ringing
          </button>
          <button onclick="window.dismissAlarmPermanently('${reminderId}')" class="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-sm text-sm">
            🚫 Dismiss Permanently
          </button>
        </div>
        <button onclick="window.closeAlertPopup('${reminderId}')" class="absolute top-2 right-2 text-white/70 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    `;
    document.body.appendChild(alertDiv);
    alertDialogRefs.current.set(reminderId, alertDiv);
  };

  // Global functions for alert dialog buttons
  (window as any).stopCurrentAlarm = (reminderId: string) => {
    console.log(`🔘 stopCurrentAlarm called for: ${reminderId}`);
    stopAlarmCompletely(reminderId, false);
  };
  
  (window as any).dismissAlarmPermanently = (reminderId: string) => {
    console.log(`🔘 dismissAlarmPermanently called for: ${reminderId}`);
    stopAlarmCompletely(reminderId, true);
  };
  
  (window as any).closeAlertPopup = (reminderId: string) => {
    console.log(`🔘 closeAlertPopup called for: ${reminderId} - Closing popup only`);
    const alertDiv = alertDialogRefs.current.get(reminderId);
    if (alertDiv && alertDiv.parentNode) {
      alertDiv.remove();
      alertDialogRefs.current.delete(reminderId);
    }
  };


  const getNotificationCount = () => notifications.length + activeAlarms.size;

  const getTimeRemaining = (dueDate: string) => {
    const diff = new Date(dueDate).getTime() - new Date().getTime();
    if (diff <= 0) {
      const mins = Math.abs(Math.floor(diff / (1000 * 60)));
      return mins < 60 ? `${mins} min${mins > 1 ? 's' : ''} overdue` : `${Math.floor(mins / 60)} hr${Math.floor(mins / 60) > 1 ? 's' : ''} overdue`;
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours >= 24) return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''} left`;
    return `${minutes} min${minutes > 1 ? 's' : ''} left`;
  };

  const getNotificationColor = (dueDate: string, priority: string) => {
    const now = new Date(), due = new Date(dueDate);
    if (due < now) return 'border-red-500 bg-red-50';
    if (priority === 'high') return 'border-orange-500 bg-orange-50';
    if (due.getTime() - now.getTime() <= 3600000) return 'border-yellow-500 bg-yellow-50';
    return 'border-blue-500 bg-blue-50';
  };

  // Add CSS animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } .animate-slide-in { animation: slideIn 0.3s ease-out; }`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Helper function to get row background color based on status
  const getRowClassName = (record: any) => {
    const statusValue = record.status;
    
    // If status is 3 (Converted/Won), apply light green background
    if (statusValue === 3) {
      return "bg-green-50/30 hover:bg-green-50/50";
    }
    
    // Default row styling
    return "";
  };

  // Helper function to get status badge component
  const getStatusBadge = (record: any) => {
    const statusValue = record.status;
    const statusName = record.leadstatus?.statusName || "";
    const statusColor = record.leadstatus?.color || "";
    
    if (statusValue === 3 || statusName === "Won" || statusName === "Converted") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
          <CheckCircle size={12} />
          Won
        </span>
      );
    }
    
    if (statusName) {
      return (
        <span 
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border"
          style={{ 
            backgroundColor: `${statusColor}20`, 
            color: statusColor,
            borderColor: `${statusColor}40`
          }}
        >
          {statusName}
        </span>
      );
    }
    
    return <span className="text-xs text-slate-400">-</span>;
  };

  const columns: Column[] = [
    {
      title: "Lead ID",
      dataIndex: "LeadId",
      key: "LeadId",
      width: "140px",
      sortable: true,
      render: (val: any) => <span className="text-[12px] font-bold text-[#0d1954] uppercase tracking-wider">{val}</span>,
    },
    {
      title: "Name",
      dataIndex: "manualData",
      key: "name",
      render: (data: any) => <span className="text-[13px] text-slate-700 font-semibold">{data?.name || "-"}</span>,
    },
    {
      title: "Email",
      dataIndex: "manualData",
      key: "email",
      render: (data: any) => <span className="text-[13px] text-slate-500 lowercase">{data?.email || "-"}</span>,
    },
    {
      title: "Company",
      dataIndex: "manualData",
      key: "company",
      render: (data: any) => <span className="text-[13px] text-slate-500">{data?.company || "-"}</span>,
    },
    {
      title: "Phone",
      dataIndex: "manualData",
      key: "mobileNo",
      render: (data: any) => <span className="text-[13px] text-slate-600 font-medium">{data?.mobileNo || "-"}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "120px",
      sortable: true,
      render: (_: any, record: any) => getStatusBadge(record),
    },
    {
      title: "Follow-Up",
      dataIndex: "followUps",
      key: "followUps",
      width: "250px",
      render: (followUps: any, record: any) => {
        if (!followUps || followUps.length === 0) return <span className="text-[11px] text-slate-400 italic">No Follow-Ups</span>;
        const validFollowUps = followUps.filter((f: any) => f.dateTime || f.reminderDateTime);
        if (validFollowUps.length === 0) return <span className="text-[11px] text-slate-400 italic">No scheduled dates</span>;
        
        return (
          <div className="flex flex-col gap-1 max-w-[230px]">
            {/* Show only 1 follow-up (the last one) using .slice(-1) instead of .slice(-2) */}
            {validFollowUps.slice(-1).map((followUp: any, idx: number) => {
              const targetTime = followUp.reminderDateTime || followUp.dateTime;
              const isOverdue = new Date(targetTime) < new Date();
              const isToday = new Date(targetTime).toDateString() === new Date().toDateString();
              
              const timeStamp = new Date(targetTime).getTime();
              const baseReminderId = `${record.LeadId}_${followUp._id || idx}_${timeStamp}`;
              
              const activeStage = Array.from(activeAlarms.values()).find(a => a.baseId === baseReminderId);
              const hasActiveAlarm = !!activeStage;
              
              const timeUntil = new Date(targetTime).getTime() - new Date().getTime();
              const minutesUntil = Math.floor(timeUntil / (1000 * 60));
              
              let alarmStatus = '';
              if (followUp.isSetTimer && !hasActiveAlarm) {
                if (minutesUntil <= 10 && minutesUntil > 5) alarmStatus = '⏰ 10 min warning';
                else if (minutesUntil <= 5 && minutesUntil > 0) alarmStatus = '⚠️ 5 min warning';
                else if (minutesUntil <= 0) alarmStatus = '🔴 Overdue';
              }
              
              // Check if this specific stage is dismissed
              const is10mDismissed = dismissedAlarms.has(`${baseReminderId}_10m`);
              const is5mDismissed = dismissedAlarms.has(`${baseReminderId}_5m`);
              const isExactDismissed = dismissedAlarms.has(`${baseReminderId}_exact`);
              
              return (
                <div key={idx} className={`flex flex-col gap-0.5 pb-1 border-b border-slate-100 last:border-0 p-2 rounded-lg ${hasActiveAlarm ? 'bg-red-50 border-red-200' : ''}`}>
                  <div className="flex items-center gap-1 flex-wrap">
                    {hasActiveAlarm && (
                      <span className="text-[10px] px-1 py-0.5 rounded bg-red-500 text-white animate-pulse">
                        🔔 {activeStage.stageLabel}
                      </span>
                    )}
                    {alarmStatus && !hasActiveAlarm && (
                      <span className="text-[10px] px-1 py-0.5 rounded bg-yellow-500 text-white">
                        {alarmStatus}
                      </span>
                    )}
                    
                    <span className={`text-[10px] font-bold ${isOverdue ? 'text-red-600' : isToday ? 'text-orange-600' : 'text-indigo-600'}`}>
                      {new Date(targetTime).toLocaleString()}
                    </span>
                    {followUp.priority && (
                      <span className={`text-[8px] px-1 py-0.5 rounded ${followUp.priority === 'high' ? 'bg-red-100 text-red-700' : followUp.priority === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {followUp.priority}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 line-clamp-2">{followUp.notes || followUp.note || 'No notes'}</span>
                  
                  {/* Show dismissed status */}
                  {(is10mDismissed || is5mDismissed || isExactDismissed) && (
                    <div className="flex gap-1 mt-1">
                      {is10mDismissed && <span className="text-[8px] text-gray-400">10m dismissed</span>}
                      {is5mDismissed && <span className="text-[8px] text-gray-400">5m dismissed</span>}
                      {isExactDismissed && <span className="text-[8px] text-gray-400">Exact dismissed</span>}
                    </div>
                  )}
                  
                  {hasActiveAlarm && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); stopAlarmCompletely(activeStage.id, false); }}
                      className="text-[10px] text-red-600 hover:text-red-800 mt-1 text-left font-bold flex items-center gap-1"
                    >
                      <VolumeX size={12}/> Stop Ringing
                    </button>
                  )}
                </div>
              );
            })}
            {/* Show +1, +2 etc if there are more than 1 valid follow-ups */}
            {validFollowUps.length > 1 && (
              <span className="text-[10px] font-medium text-slate-500 pl-1">
                +{validFollowUps.length - 1} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: "Source",
      dataIndex: "leadsource",
      key: "source",
      render: (val: any) => <span className="text-[12px] text-[#0d1954] font-bold bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">{val || "N/A"}</span>,
    },
  ];


  return (
    <div className="">
        <div className="flex items-center gap-2">

          <div className="relative" ref={notificationRef}>

            <AnimatePresence>
              {showNotificationPanel && (
                <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
                    <div>
                      <h3 className="font-bold text-slate-800 flex items-center gap-2"><BellRing className="w-5 h-5 text-indigo-600" /> Reminders</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {activeAlarms.size > 0 && <span className="text-red-600 font-semibold">{activeAlarms.size} Active Ringing</span>}
                        {activeAlarms.size > 0 && notifications.length > 0 && ' • '}
                        {notifications.length > 0 && `${notifications.length} Upcoming`}
                      </p>
                    </div>
                    {getNotificationCount() > 0 && (
                      <button onClick={() => {
                        activeAlarms.forEach((_, id) => stopAlarmCompletely(id, false));
                        setNotifications([]);
                      }} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {getNotificationCount() === 0 ? (
                      <div className="p-8 text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">All caught up!</p>
                      </div>
                    ) : (
                      <>
                        {activeAlarms.size > 0 && (
                          <div className="border-b border-red-100">
                            <div className="px-4 py-2 bg-red-50"><h4 className="text-xs font-bold text-red-700 flex items-center gap-2"><AlertCircle className="w-3 h-3 animate-pulse" /> ACTIVE ALARMS</h4></div>
                            {Array.from(activeAlarms.entries()).map(([id, data]) => (
                              <motion.div key={id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 border-b hover:bg-slate-50 bg-red-50 cursor-pointer`} onClick={() => { setSearchParams({ modal: "schedule-followup", LeadId: data.leadId }); setShowNotificationPanel(false); }}>
                                <div className="flex justify-between">
                                  <div>
                                    <span className="font-semibold text-sm text-slate-800">{data.leadName}</span>
                                    <p className="text-xs text-slate-600 mb-2">{data.followUpNote}</p>
                                    <span className="text-xs font-bold text-red-600">🔔 {data.stageLabel}</span>
                                  </div>
                                  <button onClick={(e) => { e.stopPropagation(); stopAlarmCompletely(id, false); }} className="text-slate-400 hover:text-red-500">
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                        
                        {notifications.map((n) => (
                          <motion.div key={n.baseId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`p-4 border-b hover:bg-slate-50 cursor-pointer ${getNotificationColor(n.followUpDate, n.priority)}`} onClick={() => { setSearchParams({ modal: "schedule-followup", LeadId: n.leadId }); setShowNotificationPanel(false); }}>
                            <div className="flex justify-between">
                              <div>
                                <span className="font-semibold text-sm text-slate-800">{n.leadName}</span>
                                <p className="text-xs text-slate-600 mb-2">{n.followUpNote}</p>
                                <span className="text-xs text-slate-500"><Clock className="w-3 h-3 inline mr-1"/>{getTimeRemaining(n.followUpDate)}</span>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); setNotifications(prev => prev.filter(notif => notif.id !== n.id)); }} className="text-slate-400 hover:text-red-500">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      {data.length === 0 ? (
        <TableNotFound 
          image={Generating_new_leads}
          title="No Leads Yet "
          description="Start adding your first lead to manage and grow your business effectively."
          buttonText="Create New Lead"
          buttonIcon={<PlusCircle size={18} />}
          onAction={() => navigate(`/${localStorage.getItem("subdomain")}/leads/create-leads`)}
        />
      ) : (
        <Table
          columns={columns}
          data={data}
          showSelection={true}
          onSelectionChange={(selectedRows: any[]) => setSelectedIds(selectedRows.map(r => r.LeadId))}
          enableSearch={true}
          searchPlaceholder="Search Leads..."
          actionButtons={{
            showView: Roles?.canRead,
            showEdit: Roles?.canEdit,
            showFollowUp: Roles?.canCreate,   
            showConvert: Roles?.canCreate,  
            onEdit: Roles?.canEdit ? (record: any) => navigate(`/${localStorage.getItem("subdomain")}/leads/create-leads`, { state: { tableData: record, tableId: record.LeadId } }) : undefined,
            onView: Roles?.canRead ? (record: any) => navigate(`/${localStorage.getItem("subdomain")}/leads/view-leads`, { state: { tableId: record.LeadId, mainId: record._id } }) : undefined,
            onFollowUp: Roles?.canCreate ? (record: any) => setSearchParams({ modal: "schedule-followup", LeadId: record.LeadId }) : undefined,
            onConvert: Roles?.canCreate ? (record: any) => setSearchParams({ modal: "convert-customer", LeadId: record.LeadId }) : undefined,
          }}
          pagination={{ currentPage, itemsPerPage, totalItems: data.length, onPageChange: setCurrentPage, onItemsPerPageChange: (s: number) => { setItemsPerPage(s); setCurrentPage(1); } }}
          onRowClick={(record) => {
            if (Roles?.canRead) {
              navigate(`/${localStorage.getItem("subdomain")}/leads/view-leads`, { state: { tableId: record.LeadId, mainId: record._id } });
            }
          }}
        />
      )}

      {searchParams.get("modal") === "schedule-followup" && <AddFollowUp_Model tableId={selectedLeadId} selectedData={selectedLeadData} />}
      {searchParams.get("modal") === "convert-customer" && <Convert_custommer_Model tableId={selectedLeadId} selectedData={selectedLeadData} />}
    </div>
  );
};

export default Table_View;