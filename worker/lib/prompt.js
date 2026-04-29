export function buildDinnerImagePrompt(plan) {
  const dishes = plan.dishes
    .map((dish) => `${dish.name}, ${dish.servings}${dish.notes ? `, ${dish.notes}` : ""}`)
    .join("; ");
  const shoppingLine = plan.shoppingNeeded && plan.shoppingItems.length > 0
    ? ` Include fresh ingredients like ${plan.shoppingItems.join(", ")}.`
    : "";

  return `Warm family dinner recipe poster, Chinese home cooking, clean editorial layout, ${plan.title}. Dishes: ${dishes}. Dinner time ${plan.cookTime}.${shoppingLine}`;
}
