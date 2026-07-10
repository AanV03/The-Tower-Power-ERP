import { Button } from "@/components/ui/button";

export function PlanSelectButton({
  onClick,
  selected,
}: {
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <Button
      type="button"
      className="w-full"
      variant={selected ? "secondary" : "default"}
      onClick={onClick}
    >
      Seleccionar
    </Button>
  );
}
