using System;

namespace ProjetoFinancas.Classes
{
    public class Utilizador
    {
        
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Senha { get; set; } = string.Empty;
        public string Perfil { get; set; } = string.Empty;


        public void Registar()
        {
            Console.WriteLine("Utilizador registado (método Registar chamado).");
        }
    }
}
