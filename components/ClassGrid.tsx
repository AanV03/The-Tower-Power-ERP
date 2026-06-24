"use client";
import { motion } from "framer-motion";

const classes = [
  { title: "Iron Room", desc: "Heavy compounds & powerlifting." },
  { title: "Asylum HIIT", desc: "High intensity cardiovascular conditioning." },
  { title: "The Ring", desc: "Muay Thai & competitive boxing." }
];

export default function ClassGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-8 bg-zinc-950">
      {classes.map((item, index) => (
        <motion.div
          key={index}
          whileHover={{ scale: 1.03, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className="h-[500px] bg-zinc-900 border border-zinc-800 p-8 flex flex-col justify-end cursor-pointer group"
        >
          <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{item.title}</h3>
          <p className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}