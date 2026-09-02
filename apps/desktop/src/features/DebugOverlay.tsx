import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Button, InlineMessage } from '@allmytools/ui';

export type DebugTargetInfo = Readonly<{
  element: Element;
  label: string;
  source: string;
  code: string;
  kind: string;
  rect: DOMRect;
}>;

type DebugOverlayProps = Readonly<{
  enabled: boolean;
  root: HTMLElement | null;
  onExit: () => void;
  onLog?: (message: string) => void;
}>;

const sourceFallback = '工具未声明源码定位';

function kindFor(element: Element): string {
  const declared = element.getAttribute('data-debug-kind');
  if (declared) return declared;
  const tag = element.tagName.toLowerCase();
  if (['button', 'input', 'select', 'textarea'].includes(tag)) return '控件';
  if (['p', 'span', 'strong', 'label', 'h1', 'h2', 'h3'].includes(tag)) return '文本';
  return '区域';
}

function targetFor(element: Element, root: HTMLElement): DebugTargetInfo {
  // 叶子节点可以声明自己的源码行；没有声明时才回退到最近的区域目标。
  const sourceTarget = element.closest('[data-debug-source], [data-debug-target]') ?? root;
  const codeTarget = element.closest('[data-debug-code], [data-debug-target]') ?? root;
  const kind = kindFor(element);
  const isSourceTarget = element === sourceTarget;
  return {
    element,
    label:
      element.getAttribute('data-debug-label') ??
      (isSourceTarget
        ? sourceTarget.textContent?.trim().slice(0, 80)
        : `${kind} ${element.textContent?.trim().slice(0, 60) ?? element.tagName}`) ??
      element.tagName,
    source: sourceTarget.getAttribute('data-debug-source') ?? sourceFallback,
    code:
      element.getAttribute('data-debug-code') ??
      sourceTarget.getAttribute('data-debug-code') ??
      codeTarget.getAttribute('data-debug-code') ??
      element.outerHTML.slice(0, 800),
    kind,
    rect: element.getBoundingClientRect(),
  };
}

export function DebugOverlay({ enabled, root, onExit, onLog }: DebugOverlayProps) {
  const [hovered, setHovered] = useState<DebugTargetInfo>();
  const [selected, setSelected] = useState<DebugTargetInfo>();
  const rootRef = useRef(root);
  const lastHoverRef = useRef<string | undefined>(undefined);
  rootRef.current = root;

  useEffect(() => {
    if (!enabled || !root) {
      setHovered(undefined);
      setSelected(undefined);
      return undefined;
    }

    const updateHover = (event: PointerEvent) => {
      const currentRoot = rootRef.current;
      const target = event.target;
      if (!currentRoot || !(target instanceof Element) || !currentRoot.contains(target)) return;
      if (target.closest('.debug-overlay-panel')) return;
      if (target.closest('.runtime-console')) return;
      const next = targetFor(target, currentRoot);
      setHovered(next);
      const hoverKey = `${next.kind}:${next.label}`;
      if (hoverKey !== lastHoverRef.current) {
        lastHoverRef.current = hoverKey;
        onLog?.(`悬浮 ${next.kind}：${next.label}`);
      }
    };
    const select = (event: MouseEvent) => {
      const currentRoot = rootRef.current;
      const target = event.target;
      if (!currentRoot || !(target instanceof Element) || !currentRoot.contains(target)) return;
      if (target.closest('.runtime-console')) return;
      if (target.closest('.debug-toggle-button')) return;
      event.preventDefault();
      event.stopPropagation();
      const next = targetFor(target, currentRoot);
      setSelected(next);
      onLog?.(`点击 ${next.kind}：${next.label}，定位 ${next.source}`);
    };
    const clear = () => {
      setHovered((current) => (current ? targetFor(current.element, root) : current));
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onLog?.('按下 Escape，退出调试模式');
        onExit();
      }
    };
    document.addEventListener('pointermove', updateHover, true);
    document.addEventListener('click', select, true);
    window.addEventListener('resize', clear);
    window.addEventListener('scroll', clear, true);
    window.addEventListener('keydown', escape, true);
    return () => {
      document.removeEventListener('pointermove', updateHover, true);
      document.removeEventListener('click', select, true);
      window.removeEventListener('resize', clear);
      window.removeEventListener('scroll', clear, true);
      window.removeEventListener('keydown', escape, true);
    };
  }, [enabled, onExit, onLog, root]);

  const boxStyle = useMemo(() => {
    if (!hovered) return undefined;
    return {
      left: `${hovered.rect.left}px`,
      top: `${hovered.rect.top}px`,
      width: `${hovered.rect.width}px`,
      height: `${hovered.rect.height}px`,
      '--debug-color':
        hovered.kind === '控件'
          ? 'var(--amt-color-status-warning)'
          : hovered.kind === '文本'
            ? 'var(--amt-color-status-success)'
            : 'var(--amt-color-status-info)',
    } as CSSProperties;
  }, [hovered]);

  if (!enabled) return null;
  return (
    <>
      {hovered ? (
        <div className="debug-overlay-box" style={boxStyle} aria-hidden="true">
          <span>
            {hovered.kind} · {hovered.label}
          </span>
        </div>
      ) : null}
      {selected ? (
        <aside className="debug-overlay-panel" role="dialog" aria-label="元素源码定位">
          <header>
            <div>
              <p className="eyebrow">调试元素</p>
              <h2>{selected.label || selected.kind}</h2>
            </div>
            <Button variant="secondary" onClick={() => setSelected(undefined)}>
              关闭
            </Button>
          </header>
          <dl>
            <div>
              <dt>类型</dt>
              <dd>{selected.kind}</dd>
            </div>
            <div>
              <dt>代码位置</dt>
              <dd>{selected.source}</dd>
            </div>
          </dl>
          {selected.source === sourceFallback ? (
            <InlineMessage title="缺少源码定位">
              该元素所属工具尚未声明 data-debug-source。
            </InlineMessage>
          ) : null}
          <pre>{selected.code}</pre>
        </aside>
      ) : null}
    </>
  );
}
