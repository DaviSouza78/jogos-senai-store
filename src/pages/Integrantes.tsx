import { motion } from 'framer-motion';

const members = [
  { initials: 'DM', name: 'Davi Marcondes Paes de Souza', email: 'davisouza4404@gmail.com' },
  { initials: 'RC', name: 'Renan Ramos Capeleti', email: 'renan.capeletisenai@gmail.com' },
  { initials: 'KA', name: 'Kauan Alejandro da Rosa', email: 'kauan.alejandrosenai@gmail.com' },
];

const Integrantes = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-6 py-12 max-w-4xl"
    >
      <div className="flex items-center gap-4 mb-12">
        <div className="w-1 h-8 bg-accent rounded-full" />
        <h1 className="font-display text-3xl font-bold uppercase tracking-wider">Integrantes do Grupo</h1>
      </div>

      <div className="space-y-12">
        {/* Info Card */}
        <motion.section 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-panel p-8 rounded-3xl"
        >
          <h2 className="text-xl font-bold mb-6 text-white uppercase tracking-wider">Informações do Trabalho</h2>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-white/5">
              <span className="text-cyan font-medium">Faculdade</span>
              <span className="text-muted">Senai</span>
            </div>
            <div className="flex justify-between py-3 border-b border-white/5">
              <span className="text-cyan font-medium">Professor</span>
              <span className="text-muted">Marcello Tuba</span>
            </div>
            <div className="flex justify-between py-3 border-b border-white/5">
              <span className="text-cyan font-medium">Matéria</span>
              <span className="text-muted">Desenvolvimento Front-Web</span>
            </div>
          </div>
        </motion.section>

        {/* Members Grid */}
        <section>
          <h2 className="text-xl font-bold mb-6 text-white uppercase tracking-wider">Membros</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {members.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-8 rounded-3xl text-center group hover:border-cyan/50 transition-colors"
              >
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-accent to-cyan flex items-center justify-center mb-6 shadow-xl shadow-cyan/20 group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-display font-bold text-white">{member.initials}</span>
                </div>
                <h3 className="font-bold text-white mb-2">{member.name}</h3>
                <p className="text-xs text-muted truncate px-2">{member.email}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default Integrantes;
