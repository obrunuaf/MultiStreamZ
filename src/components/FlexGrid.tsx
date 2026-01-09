import React, { useCallback, useEffect, useState } from 'react';
import { Layout, Model, TabNode, type IJsonModel, Actions, DockLocation } from 'flexlayout-react';
import 'flexlayout-react/style/dark.css';
import { useStreamStore } from '../store/useStreamStore';
import { StreamSlot } from './StreamSlot';
import { ChatPanel } from './ChatPanel';
import { StatusPanel } from './StatusPanel';

// Custom CSS for FlexLayout to match MultiStreamZ aesthetic
const CUSTOM_CSS = `
  .flexlayout__layout { background-color: #0a0a0a; }
  .flexlayout__tab { background-color: #0d0d0d; }
  .flexlayout__tabset { background-color: #1a1a1a; }
  .flexlayout__tabset_header { background-color: #1a1a1a; border-bottom: 1px solid #262626; }
  .flexlayout__tabset_tabbar_outer { background-color: #1a1a1a; }
  .flexlayout__tab_button { background-color: transparent; border: none; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #666; cursor: pointer; }
  .flexlayout__tab_button--selected { color: #fff; background-color: #262626; }
  .flexlayout__tab_button:hover { color: #aaa; background-color: #262626; }
  .flexlayout__splitter { background-color: #1a1a1a; }
  .flexlayout__splitter:hover { background-color: #262626; }
`;

export const FlexGrid: React.FC = () => {
  const { streams, setFlexLayoutState, flexLayoutState } = useStreamStore();
  
  // Initial model derived from current streams
  const [model] = useState(() => {
    const json: IJsonModel = flexLayoutState ? JSON.parse(flexLayoutState) : {
      global: {
        tabEnableClose: false,
        splitterSize: 2,
      },
      layout: {
        type: 'row',
        weight: 100,
        children: [
          {
            type: 'tabset',
            weight: 75,
            children: streams.map((stream) => ({
              type: 'tab',
              name: stream.channelName,
              component: 'stream',
              id: stream.id,
            })),
          },
          {
            type: 'tabset',
            weight: 25,
            children: [
              { type: 'tab', name: 'CHAT', component: 'chat', id: 'chat-tab' },
              { type: 'tab', name: 'STATUS', component: 'status', id: 'status-tab' },
            ]
          }
        ],
      },
    };
    return Model.fromJson(json);
  });

  // Keep model in sync when streams are added or removed
  useEffect(() => {
    if (!model) return;
    
    // 1. Add missing streams
    streams.forEach(stream => {
      try {
        model.getNodeById(stream.id);
      } catch {
        // Node doesn't exist, add it to the first tabset
        const root = model.getRoot();
        const firstTabset = root.getChildren().find(c => c.getType() === 'tabset') || 
                          root.getChildren()[0]?.getChildren().find(c => c.getType() === 'tabset');
        
        if (firstTabset) {
          model.doAction(Actions.addNode({
            type: 'tab',
            component: 'stream',
            name: stream.channelName,
            id: stream.id,
          }, firstTabset.getId(), DockLocation.CENTER, -1));
        }
      }
    });

    // 2. Remove streams that are no longer in the store
    // FlexLayout handles this via the factory mostly, but we could prune the model here if needed.
  }, [streams, model]);

  const onModelChange = useCallback(() => {
    if (model) {
      setFlexLayoutState(JSON.stringify(model.toJson()));
    }
  }, [model, setFlexLayoutState]);

  const factory = useCallback((node: TabNode) => {
    const component = node.getComponent();
    const id = node.getId();

    if (component === 'stream') {
      const stream = streams.find((s) => s.id === id);
      if (stream) {
        return <StreamSlot stream={stream} />;
      }
    }

    if (component === 'chat') {
        return <ChatPanel />;
    }

    if (component === 'status') {
        return <StatusPanel />;
    }

    return <div>Component not found</div>;
  }, [streams]);

  return (
    <div className="flex-1 w-full h-full p-0.5 relative">
      <style>{CUSTOM_CSS}</style>
      <Layout model={model} factory={factory} onModelChange={onModelChange} />
    </div>
  );
};
