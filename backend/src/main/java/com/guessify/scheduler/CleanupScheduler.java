package com.guessify.scheduler;

import com.guessify.service.ChallengeService;
import com.guessify.service.DailyService;
import com.guessify.service.RoomService;
import com.guessify.service.SoloService;
import com.guessify.security.SecureSessionService;
import com.guessify.util.RateLimitService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class CleanupScheduler {

    private final RoomService roomService;
    private final ChallengeService challengeService;
    private final DailyService dailyService;
    private final SoloService soloService;
    private final SecureSessionService secureSessionService;
    private final RateLimitService rateLimitService;

    public CleanupScheduler(RoomService roomService, ChallengeService challengeService,
                            DailyService dailyService, SoloService soloService,
                            SecureSessionService secureSessionService,
                            RateLimitService rateLimitService) {
        this.roomService = roomService;
        this.challengeService = challengeService;
        this.dailyService = dailyService;
        this.soloService = soloService;
        this.secureSessionService = secureSessionService;
        this.rateLimitService = rateLimitService;
    }

    @Scheduled(fixedRate = 3600000)
    public void cleanupExpired() {
        roomService.cleanupExpired();
        challengeService.cleanupExpired();
        dailyService.cleanupOldSessions();
        soloService.cleanup();
        secureSessionService.cleanupExpired();
    }

    @Scheduled(fixedRate = 60000)
    public void resetRateLimits() {
        rateLimitService.resetMinuteCounters();
    }
}
