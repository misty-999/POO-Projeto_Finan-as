using System;

namespace ProjetoFinancas.Classes
{
    public class Administrador : Utilizador
    {
        public void GerirUtilizadores()
        {
            Console.WriteLine(" utilizadores...");
        }

        public void GerarRelatorios()
        {
            Console.WriteLine(" relatórios...");
        }
        public string UserType { get; set; } = "admin";
    }
}
