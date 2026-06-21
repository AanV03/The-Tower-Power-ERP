const classes = [
  { title: "Iron Room", desc: "Heavy compounds & powerlifting." },
  { title: "Asylum HIIT", desc: "High intensity cardiovascular conditioning." },
  { title: "The Ring", desc: "Muay Thai & competitive boxing." },
];

export default function ClassGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 bg-zinc-950 sm:grid-cols-2 lg:grid-cols-3">
      {classes.map((item, index) => (
        <article
          key={index}
          className="group flex min-h-72 flex-col justify-end border border-zinc-800 bg-zinc-900 p-5 transition-transform duration-300 hover:-translate-y-2 sm:min-h-96 sm:p-6 lg:min-h-[500px] lg:p-8"
        >
          <h3 className="mb-2 text-2xl font-bold text-white transition-colors group-hover:text-amber-400 sm:text-3xl">
            {item.title}
          </h3>
          <p className="text-sm leading-6 text-zinc-400 opacity-100 transition-opacity duration-300 sm:text-base lg:opacity-0 lg:group-hover:opacity-100">
            {item.desc}
          </p>
        </article>
      ))}
    </div>
  );
}
