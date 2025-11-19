using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

/*
 Persistencia.cs
 - Responsabilidade: ler e gravar listas simples como ficheiros JSON em wwwroot/data/
 - Usado por Program.cs para persistir Utilizadores, Transacoes e Categorias.
 - Observações:
   * Este é um método simples e direto, adequado para protótipos.
   * Não é otimizado para escrita concorrente: se vários pedidos escreverem ao mesmo tempo,
     pode haver perda de dados. Para produção, usar uma base de dados ou mecanismos de travas.
*/
namespace ProjetoFinancas.Classes
{
    public class Persistencia
    {
        // Base path para os ficheiros JSON
        private string caminhoBase;

        public Persistencia(string _unused = "")
        {
            // Pasta onde os JSON ficam (visível pelo servidor estático)
            caminhoBase = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data");
            if (!Directory.Exists(caminhoBase)) Directory.CreateDirectory(caminhoBase);
        }

        // Helpers genéricos para ler/gravar listas
        private async Task SaveListAsync<T>(string fileName, List<T> list)
        {
            var path = Path.Combine(caminhoBase, fileName);
            var json = JsonSerializer.Serialize(list, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(path, json);
        }

        private async Task<List<T>> LoadListAsync<T>(string fileName)
        {
            var path = Path.Combine(caminhoBase, fileName);
            if (!File.Exists(path)) return new List<T>();
            var json = await File.ReadAllTextAsync(path);
            return JsonSerializer.Deserialize<List<T>>(json) ?? new List<T>();
        }

        // Métodos públicos (específicos para o projecto)
        public Task GuardarUtilizadores(List<Utilizador> list) => SaveListAsync("utilizadores.json", list);
        public Task GuardarTransacoes(List<Transacao> list) => SaveListAsync("transacoes.json", list);
        public Task GuardarCategorias(List<Categoria> list) => SaveListAsync("categorias.json", list);

        public Task<List<Utilizador>> CarregarUtilizadores() => LoadListAsync<Utilizador>("utilizadores.json");
        public Task<List<Transacao>> CarregarTransacoes() => LoadListAsync<Transacao>("transacoes.json");
        public Task<List<Categoria>> CarregarCategorias() => LoadListAsync<Categoria>("categorias.json");
    }
}