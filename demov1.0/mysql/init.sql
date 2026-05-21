CREATE DATABASE IF NOT EXISTS xiuxian_demo
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE xiuxian_demo;

CREATE TABLE IF NOT EXISTS game_session (
  id INT AUTO_INCREMENT PRIMARY KEY,
  character_name VARCHAR(50) NOT NULL DEFAULT '李青云',
  realm VARCHAR(50) NOT NULL DEFAULT '练气中期',
  state_json JSON NOT NULL,
  status ENUM('active', 'ended') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS story_node (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  node_type VARCHAR(20) NOT NULL DEFAULT 'narrative',
  narrative_text TEXT NOT NULL,
  choices_json JSON DEFAULT NULL,
  chosen_index INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES game_session(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
