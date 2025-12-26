import React from 'react';
import { Clock, Loader2 } from 'lucide-react';
import type { QpAdmRun } from '../../types/qpadm';

interface QpAdmQueueInfoProps {
  run: QpAdmRun;
}

export const QpAdmQueueInfo: React.FC<QpAdmQueueInfoProps> = ({ run }) => {
  if (run.status !== 'queued' || !run.queue_info) {
    return null;
  }

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-300 mb-2">Task Queued</h3>
          <p className="text-sm text-slate-300 mb-4">
            Your qpAdm analysis has been added to the queue and will be processed soon.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-800/60 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Queue Position</div>
              <div className="text-2xl font-bold text-yellow-300">
                #{run.queue_info.position_in_queue}
              </div>
            </div>
            
            <div className="bg-slate-800/60 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Tasks Ahead</div>
              <div className="text-2xl font-bold text-yellow-300">
                {run.queue_info.tasks_ahead}
              </div>
            </div>
            
            <div className="bg-slate-800/60 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Estimated Wait</div>
              <div className="text-2xl font-bold text-yellow-300">
                ~{run.queue_info.estimated_wait_minutes} min
              </div>
            </div>
          </div>
          
          {run.queue_info.is_processing && (
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-300">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>A task is currently being processed...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};