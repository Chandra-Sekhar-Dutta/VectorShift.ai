// draggableNode.js

export const DraggableNode = ({ type, label, color = '#3b82f6', icon: Icon }) => {
    const onDragStart = (event, nodeType) => {
      const appData = { nodeType }
      event.target.style.cursor = 'grabbing';
      event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
      event.dataTransfer.effectAllowed = 'move';
    };
  
    return (
      <div
        className={type}
        onDragStart={(event) => onDragStart(event, type)}
        onDragEnd={(event) => (event.target.style.cursor = 'grab')}
        style={{ 
          cursor: 'grab', 
          width: '90%', 
          height: '32px',
          display: 'flex', 
          alignItems: 'center',
          gap: '8px',
          borderRadius: '6px',
          backgroundColor: color,
          justifyContent: 'flex-start', 
          flexDirection: 'row',
          paddingLeft: '10px',
          paddingRight: '10px',
          boxShadow: `0 2px 8px ${color}30`,
          transition: 'all 0.18s ease-out',
          border: 'none',
          userSelect: 'none',
          fontWeight: '600',
          fontSize: '12px',
          opacity: 0.95
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateX(2px) translateY(-1px)';
          e.currentTarget.style.boxShadow = `0 4px 12px ${color}40`;
          e.currentTarget.style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateX(0) translateY(0)';
          e.currentTarget.style.boxShadow = `0 2px 8px ${color}30`;
          e.currentTarget.style.opacity = '0.95';
        }}
        draggable
      >
          {Icon && <Icon size={14} style={{ color: '#fff', flexShrink: 0 }} />}
          <span style={{ color: '#fff', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' }}>{label}</span>
      </div>
    );
  };
  