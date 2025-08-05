use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalysisResult {
    pub total_files: usize,
    pub analyzed_files: usize,
    pub issues: Vec<Issue>,
    pub summary: AnalysisSummary,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Issue {
    pub id: String,
    pub title: String,
    pub description: String,
    pub severity: String,
    pub issue_type: String,
    pub file_path: String,
    pub line_number: u32,
    pub code_snippet: String,
    pub recommendation: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalysisSummary {
    pub total_issues: usize,
    pub high_severity: usize,
    pub medium_severity: usize,
    pub low_severity: usize,
}

#[tauri::command]
async fn analyze_directory(path: String) -> Result<AnalysisResult, String> {
    println!("🔍 Analyzing directory: {}", path);
    
    // Simulate comprehensive analysis
    let issues = vec![
        Issue {
            id: "security_1".to_string(),
            title: "Potential XSS Vulnerability".to_string(),
            description: "Direct innerHTML assignment without sanitization".to_string(),
            severity: "high".to_string(),
            issue_type: "security".to_string(),
            file_path: "src/components/App.tsx".to_string(),
            line_number: 42,
            code_snippet: "element.innerHTML = userInput;".to_string(),
            recommendation: "Use textContent or sanitize input before assignment".to_string(),
        },
        Issue {
            id: "performance_1".to_string(),
            title: "Inefficient CSS Selector".to_string(),
            description: "Complex CSS selector may impact performance".to_string(),
            severity: "medium".to_string(),
            issue_type: "performance".to_string(),
            file_path: "src/styles/main.css".to_string(),
            line_number: 15,
            code_snippet: "div > ul > li:nth-child(odd) > a[href*='example']".to_string(),
            recommendation: "Consider using CSS classes for better performance".to_string(),
        },
        Issue {
            id: "quality_1".to_string(),
            title: "Unused Variable".to_string(),
            description: "Variable declared but never used".to_string(),
            severity: "low".to_string(),
            issue_type: "quality".to_string(),
            file_path: "src/utils/helpers.js".to_string(),
            line_number: 8,
            code_snippet: "const unusedVar = 'not used';".to_string(),
            recommendation: "Remove unused variables to improve code clarity".to_string(),
        },
    ];

    let summary = AnalysisSummary {
        total_issues: issues.len(),
        high_severity: issues.iter().filter(|i| i.severity == "high").count(),
        medium_severity: issues.iter().filter(|i| i.severity == "medium").count(),
        low_severity: issues.iter().filter(|i| i.severity == "low").count(),
    };

    Ok(AnalysisResult {
        total_files: 127,
        analyzed_files: 89,
        issues,
        summary,
    })
}

#[tauri::command]
async fn get_system_info() -> Result<String, String> {
    let info = format!(
        "DrillSargeant Desktop v1.0\nPlatform: {}\nArchitecture: {}",
        std::env::consts::OS,
        std::env::consts::ARCH
    );
    Ok(info)
}

#[tauri::command]
async fn watch_directory(path: String) -> Result<String, String> {
    println!("👁️ Setting up file watcher for: {}", path);
    // Placeholder for file watching implementation
    Ok(format!("Started monitoring: {}", path))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            analyze_directory,
            get_system_info,
            watch_directory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
