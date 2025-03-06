import React from 'react';
import styles from '@/styles/SourceReferences.module.css';

const SourceReferences = ({ sources }) => {
    if (!sources || sources.length === 0) {
        return null;
    }

    // Only show sources with similarity above 0.7
    const relevantSources = sources.filter(source => source.similarity >= 0.7);
    
    if (relevantSources.length === 0) {
        return null;
    }

    return (
        <div className={styles.sourcesContainer}>
            <h4 className={styles.sourcesTitle}>Sources Referenced</h4>
            <ul className={styles.sourcesList}>
                {relevantSources.map((source, index) => (
                    <li key={`source-${index}`} className={styles.sourceItem}>
                        <a 
                            href={source.content_path} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.sourceLink}
                        >
                            {source.content_title}
                        </a>
                        <span className={styles.sourceSimilarity}>
                            {(source.similarity * 100).toFixed(1)}% match
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SourceReferences;