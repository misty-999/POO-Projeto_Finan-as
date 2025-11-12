using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;

namespace ProjetoFinancas.Classes
{
    public class Persistencia
    {
        private string caminhoArquivo { get; set; }

        public Persistencia(string nomeArquivo = "dados.json")
        {
            // Usa a pasta wwwroot/data para armazenar ficheiros JSON
            string pastaData = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "data");
            
            // Cria a pasta se não existir
            if (!Directory.Exists(pastaData))
            {
                Directory.CreateDirectory(pastaData);
            }

            caminhoArquivo = Path.Combine(pastaData, nomeArquivo);
        }

        // Guardar utilizadores em JSON
        public async Task GuardarUtilizadores(List<Utilizador> utilizadores)
        {
            try
            {
                string json = JsonSerializer.Serialize(utilizadores, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync(caminhoArquivo.Replace("dados.json", "utilizadores.json"), json);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao guardar utilizadores: {ex.Message}");
            }
        }

        // Carregar utilizadores do JSON
        public async Task<List<Utilizador>> CarregarUtilizadores()
        {
            try
            {
                string caminhoUtilizadores = caminhoArquivo.Replace("dados.json", "utilizadores.json");
                if (File.Exists(caminhoUtilizadores))
                {
                    string json = await File.ReadAllTextAsync(caminhoUtilizadores);
                    return JsonSerializer.Deserialize<List<Utilizador>>(json) ?? new List<Utilizador>();
                }
                return new List<Utilizador>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao carregar utilizadores: {ex.Message}");
                return new List<Utilizador>();
            }
        }

        // Guardar transações em JSON
        public async Task GuardarTransacoes(List<Transacao> transacoes)
        {
            try
            {
                string json = JsonSerializer.Serialize(transacoes, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync(caminhoArquivo.Replace("dados.json", "transacoes.json"), json);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao guardar transações: {ex.Message}");
            }
        }

        // Carregar transações do JSON
        public async Task<List<Transacao>> CarregarTransacoes()
        {
            try
            {
                string caminhoTransacoes = caminhoArquivo.Replace("dados.json", "transacoes.json");
                if (File.Exists(caminhoTransacoes))
                {
                    string json = await File.ReadAllTextAsync(caminhoTransacoes);
                    return JsonSerializer.Deserialize<List<Transacao>>(json) ?? new List<Transacao>();
                }
                return new List<Transacao>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao carregar transações: {ex.Message}");
                return new List<Transacao>();
            }
        }

        // Guardar categorias em JSON
        public async Task GuardarCategorias(List<Categoria> categorias)
        {
            try
            {
                string json = JsonSerializer.Serialize(categorias, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync(caminhoArquivo.Replace("dados.json", "categorias.json"), json);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao guardar categorias: {ex.Message}");
            }
        }

        // Carregar categorias do JSON
        public async Task<List<Categoria>> CarregarCategorias()
        {
            try
            {
                string caminhoCategorias = caminhoArquivo.Replace("dados.json", "categorias.json");
                if (File.Exists(caminhoCategorias))
                {
                    string json = await File.ReadAllTextAsync(caminhoCategorias);
                    return JsonSerializer.Deserialize<List<Categoria>>(json) ?? new List<Categoria>();
                }
                return new List<Categoria>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro ao carregar categorias: {ex.Message}");
                return new List<Categoria>();
            }
        }
    }
}