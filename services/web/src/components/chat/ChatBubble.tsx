import { cn } from "../../lib/utils";
import { childCopy } from "../../lib/child-copy";

export type ChatMessage = {
  role: "child" | "robot" | "system";
  text: string;
  childId?: "a" | "b";
};

export function ChatBubble({
  role,
  text,
  childId,
  size = "default",
}: ChatMessage & { size?: "default" | "large" }) {
  const isChild = role === "child";
  const isSystem = role === "system";
  const large = size === "large";
  return (
    <div className={cn("flex", isChild ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[90%] rounded-2xl leading-relaxed",
          large ? "px-5 py-3 text-lg md:text-xl" : "px-4 py-2 text-sm",
          isChild &&
            childId === "b" &&
            "bg-violet-600 text-white rounded-br-md",
          isChild &&
            childId !== "b" &&
            "bg-sky-600 text-white rounded-br-md",
          role === "robot" &&
            "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm",
          isSystem &&
            "bg-amber-50 text-amber-900 border border-amber-200 text-center w-full max-w-full",
        )}
      >
        {!isChild && role === "robot" && (
          <span
            className={cn(
              "mb-1 block font-medium text-slate-500",
              large ? "text-sm" : "text-xs",
            )}
          >
            {childCopy.robotName}
          </span>
        )}
        {text}
      </div>
    </div>
  );
}

export function ChatLog({
  messages,
  size = "default",
}: {
  messages: ChatMessage[];
  size?: "default" | "large";
}) {
  return (
    <div className="flex flex-col gap-3" role="log" aria-live="polite" aria-relevant="additions">
      {messages.map((m, i) => (
        <ChatBubble key={i} {...m} size={size} />
      ))}
    </div>
  );
}
